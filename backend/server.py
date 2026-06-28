from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Header
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import json
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime, timezone, timedelta
import httpx

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
from emergentintegrations.llm.openai import OpenAITextToSpeech


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
EMERGENT_AUTH_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

app = FastAPI(title="Anatomia AI")
api_router = APIRouter(prefix="/api")


# ============================ Models ============================

Persona = Literal["school_student", "medical_student", "doctor"]


class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    persona: Optional[Persona] = None
    xp: int = 0
    streak: int = 0
    badges: List[str] = []
    last_active: Optional[str] = None
    created_at: datetime


class SessionRequest(BaseModel):
    session_id: str


class PersonaUpdate(BaseModel):
    persona: Persona


class TutorMessage(BaseModel):
    message: str
    topic: Optional[str] = None
    persona: Optional[Persona] = None
    session_id: Optional[str] = None  # for chat persistence


class TutorReply(BaseModel):
    reply: str
    persona: Persona


class QuizSubmit(BaseModel):
    quiz_id: str
    score: int  # 0..total
    total: int
    duration_ms: Optional[int] = None


# ============================ Auth Helpers ============================


async def get_session_token(request: Request, authorization: Optional[str] = Header(None)) -> Optional[str]:
    token = request.cookies.get("session_token")
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    return token


async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    token = await get_session_token(request, authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")

    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    user_doc.setdefault("xp", 0)
    user_doc.setdefault("streak", 0)
    user_doc.setdefault("badges", [])

    return User(**user_doc)


async def maybe_get_user(request: Request, authorization: Optional[str] = Header(None)) -> Optional[User]:
    try:
        return await get_current_user(request, authorization)
    except HTTPException:
        return None


# ============================ Auth Routes ============================


@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        r = await http_client.get(
            EMERGENT_AUTH_SESSION_URL,
            headers={"X-Session-ID": payload.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Emergent session_id")
    data = r.json()

    email = data["email"]
    name = data.get("name", email)
    picture = data.get("picture")
    session_token = data["session_token"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "persona": None,
            "xp": 0,
            "streak": 0,
            "badges": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )

    response.set_cookie(
        key="session_token", value=session_token, max_age=7 * 24 * 60 * 60,
        path="/", httponly=True, secure=True, samesite="none",
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user_id": user_doc["user_id"], "email": user_doc["email"], "name": user_doc["name"],
            "picture": user_doc.get("picture"), "persona": user_doc.get("persona"),
            "xp": user_doc.get("xp", 0), "streak": user_doc.get("streak", 0),
            "badges": user_doc.get("badges", [])}


@api_router.get("/auth/me")
async def auth_me(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    d = user.model_dump()
    d.pop("created_at", None)
    return d


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, authorization: Optional[str] = Header(None)):
    token = await get_session_token(request, authorization)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


@api_router.post("/user/persona")
async def set_persona(payload: PersonaUpdate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    await db.users.update_one({"user_id": user.user_id}, {"$set": {"persona": payload.persona}})
    return {"persona": payload.persona}


# ============================ AI Tutor ============================


PERSONA_SYSTEM_PROMPTS = {
    "school_student": (
        "You are a friendly anatomy tutor for a SCHOOL STUDENT (age 12-17). "
        "Use simple language, fun analogies, everyday comparisons, and storytelling. "
        "Avoid heavy clinical jargon. Keep responses concise (3-6 short paragraphs). "
        "Focus on the human Heart and Brain."
    ),
    "medical_student": (
        "You are a rigorous anatomy and physiology tutor for a MEDICAL STUDENT. "
        "Use precise anatomical terminology (Latin/Greek roots), embryology, histology, "
        "physiological mechanisms, USMLE-style relevance. "
        "Structure: Anatomy, Physiology, Pathology, Clinical Correlation. Focus Heart & Brain."
    ),
    "doctor": (
        "You are a senior consultant briefing a PRACTICING DOCTOR. "
        "Emphasize clinical decision making, differential diagnosis, hemodynamics, imaging, "
        "interventions, evidence-based guidelines, and pitfalls. Cite landmark trials. "
        "Focus cardiology and neurology — Heart and Brain."
    ),
}


def _persona_system(persona: str, topic: Optional[str]) -> str:
    msg = PERSONA_SYSTEM_PROMPTS.get(persona, PERSONA_SYSTEM_PROMPTS["medical_student"])
    if topic:
        msg += f"\n\nCurrent topic context: {topic}."
    return msg


async def _save_chat(session_id: str, user_id: Optional[str], role: str, content: str):
    await db.chat_messages.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


@api_router.post("/tutor/chat", response_model=TutorReply)
async def tutor_chat(payload: TutorMessage, request: Request, authorization: Optional[str] = Header(None)):
    """Non-streaming tutor for compatibility."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    user = await maybe_get_user(request, authorization)
    persona = (user.persona if user else None) or payload.persona or "medical_student"
    session_id = payload.session_id or (f"tutor_{user.user_id}" if user else f"tutor_anon_{uuid.uuid4().hex[:8]}")

    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id,
                   system_message=_persona_system(persona, payload.topic)
                   ).with_model("gemini", "gemini-3-flash-preview")
    try:
        reply_text = await chat.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    user_id = user.user_id if user else None
    await _save_chat(session_id, user_id, "user", payload.message)
    await _save_chat(session_id, user_id, "assistant", str(reply_text))
    return TutorReply(reply=str(reply_text), persona=persona)


@api_router.post("/tutor/stream")
async def tutor_stream(payload: TutorMessage, request: Request, authorization: Optional[str] = Header(None)):
    """SSE streaming tutor."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    user = await maybe_get_user(request, authorization)
    persona = (user.persona if user else None) or payload.persona or "medical_student"
    session_id = payload.session_id or (f"tutor_{user.user_id}" if user else f"tutor_anon_{uuid.uuid4().hex[:8]}")
    user_id = user.user_id if user else None

    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id,
                   system_message=_persona_system(persona, payload.topic)
                   ).with_model("gemini", "gemini-3-flash-preview")

    async def event_stream():
        full = []
        await _save_chat(session_id, user_id, "user", payload.message)
        try:
            async for ev in chat.stream_message(UserMessage(text=payload.message)):
                if isinstance(ev, TextDelta):
                    full.append(ev.content)
                    data = json.dumps({"delta": ev.content})
                    yield f"data: {data}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("LLM stream error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        # Persist assistant reply
        await _save_chat(session_id, user_id, "assistant", "".join(full))
        yield f"data: {json.dumps({'done': True, 'session_id': session_id, 'persona': persona})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@api_router.get("/tutor/history")
async def tutor_history(request: Request, authorization: Optional[str] = Header(None),
                        session_id: Optional[str] = None, limit: int = 100):
    """Return chat history. Authenticated users get their default session by default."""
    user = await maybe_get_user(request, authorization)
    sid = session_id or (f"tutor_{user.user_id}" if user else None)
    if not sid:
        return {"messages": [], "session_id": None}
    docs = await db.chat_messages.find({"session_id": sid}, {"_id": 0}).sort("created_at", 1).to_list(limit)
    return {"messages": docs, "session_id": sid}


@api_router.delete("/tutor/history")
async def tutor_history_clear(request: Request, authorization: Optional[str] = Header(None),
                              session_id: Optional[str] = None):
    user = await maybe_get_user(request, authorization)
    sid = session_id or (f"tutor_{user.user_id}" if user else None)
    if not sid:
        return {"deleted": 0}
    res = await db.chat_messages.delete_many({"session_id": sid})
    return {"deleted": res.deleted_count}


# ============================ Gamification (XP / streak / badges) ============================

BADGE_RULES = [
    {"id": "first-quiz",   "name": "First Quiz",       "xp": 50,   "icon": "trophy"},
    {"id": "perfect-quiz", "name": "Perfect Score",    "xp": 100,  "icon": "star"},
    {"id": "xp-100",       "name": "100 XP Club",      "xp": 100,  "icon": "sparkles"},
    {"id": "xp-500",       "name": "Anatomy Apprentice", "xp": 500, "icon": "graduation-cap"},
    {"id": "xp-1000",      "name": "Anatomy Master",   "xp": 1000, "icon": "crown"},
    {"id": "streak-3",     "name": "3-Day Streak",     "xp": 75,   "icon": "flame"},
    {"id": "streak-7",     "name": "Week-Long Streak", "xp": 150,  "icon": "flame"},
]


def _award_badges(xp: int, streak: int, current: List[str], perfect: bool, first: bool) -> List[str]:
    new = []
    def add(b):
        if b not in current and b not in new:
            new.append(b)
    if first: add("first-quiz")
    if perfect: add("perfect-quiz")
    if xp >= 100: add("xp-100")
    if xp >= 500: add("xp-500")
    if xp >= 1000: add("xp-1000")
    if streak >= 3: add("streak-3")
    if streak >= 7: add("streak-7")
    return new


@api_router.get("/badges")
async def list_badges():
    return BADGE_RULES


@api_router.post("/quiz/submit")
async def submit_quiz(payload: QuizSubmit, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)

    # Award XP: 10 per correct + perfect bonus
    earned = payload.score * 10
    perfect = payload.score == payload.total and payload.total > 0
    if perfect:
        earned += 50

    # Streak: if last_active is yesterday, +1; if today, keep; else reset to 1
    today = datetime.now(timezone.utc).date()
    last = user.last_active
    last_date = None
    if last:
        try:
            last_date = datetime.fromisoformat(last).date()
        except Exception:
            last_date = None

    if last_date == today:
        new_streak = max(1, user.streak)
    elif last_date == today - timedelta(days=1):
        new_streak = user.streak + 1
    else:
        new_streak = 1

    # First-ever quiz?
    prior = await db.quiz_results.count_documents({"user_id": user.user_id})
    new_xp = user.xp + earned
    new_badges = _award_badges(new_xp, new_streak, user.badges, perfect, first=(prior == 0))

    await db.quiz_results.insert_one({
        "user_id": user.user_id,
        "quiz_id": payload.quiz_id,
        "score": payload.score,
        "total": payload.total,
        "earned_xp": earned,
        "perfect": perfect,
        "duration_ms": payload.duration_ms,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"xp": new_xp, "streak": new_streak,
                  "last_active": datetime.now(timezone.utc).isoformat()}},
    )
    if new_badges:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$push": {"badges": {"$each": new_badges}}},
        )

    return {"earned_xp": earned, "xp": new_xp, "streak": new_streak,
            "perfect": perfect, "new_badges": new_badges, "all_badges": user.badges + new_badges}


@api_router.get("/leaderboard")
async def leaderboard(limit: int = 10):
    top = await db.users.find({}, {"_id": 0, "name": 1, "picture": 1, "xp": 1, "streak": 1, "badges": 1}) \
        .sort("xp", -1).limit(limit).to_list(limit)
    return {"top": top}


# ============================ Text-to-Speech ============================

PERSONA_VOICE = {
    "school_student": "nova",       # energetic, upbeat
    "medical_student": "sage",      # wise, measured
    "doctor": "onyx",               # deep, authoritative
}


class TTSRequest(BaseModel):
    text: str
    persona: Optional[Persona] = None
    voice: Optional[str] = None
    speed: float = 1.0


@api_router.post("/tts")
async def text_to_speech(payload: TTSRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    text = text[:4000]
    voice = payload.voice or PERSONA_VOICE.get(payload.persona or "medical_student", "sage")
    try:
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio = await tts.generate_speech(text=text, model="tts-1", voice=voice,
                                          speed=max(0.5, min(2.0, payload.speed)),
                                          response_format="mp3")
    except Exception as e:
        logger.exception("TTS error")
        raise HTTPException(status_code=502, detail=f"TTS error: {e}")

    from fastapi.responses import Response as FastResponse
    return FastResponse(content=audio, media_type="audio/mpeg",
                        headers={"Cache-Control": "public, max-age=86400"})


# ============================ Health ============================


@api_router.get("/")
async def root():
    return {"app": "Anatomia AI", "status": "ok", "features": ["auth", "tutor", "tutor_stream", "quiz", "leaderboard"]}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

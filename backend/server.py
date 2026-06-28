from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Cookie, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone, timedelta
import httpx

from emergentintegrations.llm.chat import LlmChat, UserMessage


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
    created_at: datetime


class SessionRequest(BaseModel):
    session_id: str


class PersonaUpdate(BaseModel):
    persona: Persona


class TutorMessage(BaseModel):
    message: str
    topic: Optional[str] = None  # e.g., "Heart", "Brain", "Stroke"
    persona: Optional[Persona] = None  # override (defaults to user's persona)


class TutorReply(BaseModel):
    reply: str
    persona: Persona


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

    return User(**user_doc)


# ============================ Auth Routes ============================


@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    """Exchange Emergent session_id for a session_token, persist user, set cookie."""
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

    # Upsert user (by email)
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
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Store session
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
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user_id": user_doc["user_id"], "email": user_doc["email"], "name": user_doc["name"],
            "picture": user_doc.get("picture"), "persona": user_doc.get("persona")}


@api_router.get("/auth/me")
async def auth_me(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    return user.model_dump()


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
        "Encourage curiosity with vivid imagery. Focus on the human Heart and Brain."
    ),
    "medical_student": (
        "You are a rigorous anatomy and physiology tutor for a MEDICAL STUDENT. "
        "Use precise anatomical terminology (Latin/Greek roots), embryology, histology, "
        "and physiological mechanisms. Reference USMLE-style relevance. "
        "Structure answers with clear sections: Anatomy, Physiology, Pathology, Clinical Correlation. "
        "Focus on the human Heart and Brain."
    ),
    "doctor": (
        "You are a senior consultant briefing a PRACTICING DOCTOR. "
        "Emphasize clinical decision making, differential diagnosis, hemodynamics, imaging findings, "
        "interventions, surgical relevance, evidence-based guidelines (latest), and pitfalls. "
        "Be terse, technical, and confident. Cite landmark trials/guidelines by name when relevant. "
        "Focus on cardiology and neurology — Heart and Brain."
    ),
}


@api_router.post("/tutor/chat", response_model=TutorReply)
async def tutor_chat(payload: TutorMessage, request: Request, authorization: Optional[str] = Header(None)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    # Allow anonymous use of tutor (persona from payload), but if logged in, prefer user persona
    persona: Persona = payload.persona or "medical_student"
    try:
        user = await get_current_user(request, authorization)
        persona = user.persona or persona
        session_id = f"tutor_{user.user_id}"
    except HTTPException:
        session_id = f"tutor_anon_{uuid.uuid4().hex[:8]}"

    system_msg = PERSONA_SYSTEM_PROMPTS.get(persona, PERSONA_SYSTEM_PROMPTS["medical_student"])
    if payload.topic:
        system_msg += f"\n\nCurrent topic context: {payload.topic}."

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_msg,
    ).with_model("gemini", "gemini-3-flash-preview")

    try:
        reply_text = await chat.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return TutorReply(reply=str(reply_text), persona=persona)


# ============================ Health ============================


@api_router.get("/")
async def root():
    return {"app": "Anatomia AI", "status": "ok"}


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

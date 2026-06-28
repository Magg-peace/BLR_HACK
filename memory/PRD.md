# Anatomia AI — PRD

## Vision
Cinematic AI-powered medical education platform — Heart + Brain — inspired by Complete Anatomy, BioDigital Human and Apple Vision Pro.

## Stack
React 19 (CRA) · Tailwind · shadcn/ui · Framer Motion · @react-three/fiber 9 · @react-three/drei 10 · @react-three/postprocessing · @react-three/xr 6 · FastAPI · Motor (MongoDB) · Emergent Universal LLM Key (Gemini 3 Flash).

## User Choices
- Auth: Emergent Google OAuth
- AI Tutor: Gemini 3 Flash
- 3D: Hybrid R3F (composite anatomical meshes)

## Personas
school_student / medical_student / doctor

## Implemented (v0.2 — 2026-02)
### Core (v0.1)
- Cinematic landing, persona selection, Google OAuth, dashboard
- Heart + Brain Explorers with hotspots, layers, guided tours
- Disease Lab with severity slider (10 diseases)
- Compare mode, Learning Hub

### Upgrade (v0.2)
- **Realistic 3D anatomy**: composite heart (left/right ventricles, atria, mitral/aortic/tricuspid/pulmonary valves, aorta arch with branches, pulmonary trunk, SVC/IVC, pulmonary veins, coronary arteries, coronary fat); brain with two displaced hemispheres + corpus callosum + fissure + cerebellum (foliated) + brainstem + medulla
- **Cinematic post-processing**: ACES tonemapping + bloom + vignette + chromatic aberration
- **Web Speech narration**: Listen button on each structure (Heart + Brain explorers)
- **AI Tutor SSE streaming**: token-by-token replies via `POST /api/tutor/stream`
- **Persistent chat history**: stored in MongoDB `chat_messages`; auto-loaded on page mount; clearable
- **Quiz Arena**: 3 quizzes (Heart Basics, Brain Basics, Clinical Cardiology), MCQ flow with explanations, progress bar, results screen
- **Gamification**: XP (10/correct + 50 perfect bonus), daily streaks (UTC), 7 badges (First Quiz, Perfect Score, 100/500/1000 XP, 3/7-day streak), leaderboard endpoint
- **WebXR AR/VR Lab**: real `createXRStore` from @react-three/xr v6, Enter AR / Enter VR buttons, model swap (heart/brain)

## Backend Endpoints
- `POST /api/auth/session` · `GET /api/auth/me` · `POST /api/auth/logout` · `POST /api/user/persona`
- `POST /api/tutor/chat` (non-streaming) · `POST /api/tutor/stream` (SSE) · `GET /api/tutor/history` · `DELETE /api/tutor/history`
- `POST /api/quiz/submit` · `GET /api/leaderboard` · `GET /api/badges`

## Tests
- Backend pytest: 22/22 passing (auth, persona, tutor, tutor-stream, history, quiz, badges, leaderboard)
- Frontend e2e: all critical flows verified

## Backlog (next iterations)
### P1
- Replace procedural meshes with real GLTF medical models (commission or license)
- Hotspot quizzes (drag and drop labels on the 3D viewport)
- ECG mini-graph + WebAudio heartbeat sync
- OpenAI TTS for premium narration (vs browser TTS)
- Streaming responses for AI Tutor with proper progressive markdown rendering

### P2
- Real WebXR hand tracking + in-XR labels
- Disease progression overlays in XR
- Multi-user co-exploration via LiveKit
- Hint system in quizzes

### P3
- Lungs, kidneys, liver expansion
- Histology / cellular zoom
- CT / MRI annotated imaging gallery
- Branching clinical case scenarios

## Memory
- Test session: `/app/memory/test_credentials.md`
- Auth playbook: `/app/auth_testing.md`
- Design guidelines: `/app/design_guidelines.json`
- EMERGENT_LLM_KEY in `/app/backend/.env`

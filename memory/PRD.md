# Anatomia AI — PRD

## Vision
Cinematic AI-powered medical education platform — Heart + Brain — inspired by Complete Anatomy, BioDigital Human, Visible Body, Apple Vision Pro.

## Stack
React 19 (CRA) · Tailwind · shadcn/ui · Framer Motion · GSAP · @react-three/fiber 9 · @react-three/drei 10 · @react-three/postprocessing · @react-three/xr 6 (hand tracking) · FastAPI · Motor (MongoDB) · Emergent Universal LLM Key (Gemini 3 Flash + OpenAI TTS).

## Personas
school_student / medical_student / doctor — narration, AI tutor, content adapts automatically.

## Implemented

### v0.1 — MVP
Landing, persona selection, OAuth, dashboard, Heart + Brain explorers, Disease Lab, Compare, Learning Hub.

### v0.2 — Realism + Gamification
Composite anatomical 3D, postprocessing, narration, AI Tutor SSE+history, Quiz Arena, WebXR scaffolding.

### v0.3 — Immersive Learning Engine
OpenAI TTS, Live ECG + WebAudio lub-dub, Dynamic Tour Engine with animated particles, Drag-and-drop Pathway Quizzes, 5 brain tours.

### v0.4 — Cinematic / Interactive
- **Disease Overlay** in Heart Explorer — real-time animated plaque growth on coronary arteries (CAD), MI with necrosis patch at apex above 70% severity, ventricular haze for HF, arrhythmia sparks, valve rings. Severity slider 0-100%.
- **Hotspot Quiz** — tap-the-correct-structure quiz on the live 3D viewer. Available for heart (10 structures) and brain (9 regions). Awards XP/badges via /api/quiz/submit.
- **GSAP cinematic camera flythroughs** — every tour step tweens camera position + lookAt smoothly between hand-tuned waypoints (HEART_FLYTHROUGH × 3, BRAIN_FLYTHROUGH × 5). Float + OrbitControls auto-disable during tours.
- **WebXR Hand Tracking + Floating Labels** — `createXRStore({ hand: {...}, controller: {...} })` for Quest 3 / Vision Pro. Drei `<Html sprite>` labels render structure names around the organ in 3D space; toggle via `xr-labels-toggle`.

## Backend
- Auth: `POST /api/auth/session` · `GET /api/auth/me` · `POST /api/auth/logout` · `POST /api/user/persona`
- Tutor: `POST /api/tutor/chat` · `POST /api/tutor/stream` (SSE) · `GET /api/tutor/history` · `DELETE /api/tutor/history`
- Quiz: `POST /api/quiz/submit` · `GET /api/leaderboard` · `GET /api/badges`
- TTS: `POST /api/tts`

## Tests
- Backend pytest: 16/16 passing
- Frontend e2e: 100% on critical v0.4 flows

## Backlog
### P1
- Real GLTF medical models (licensed) for true Complete-Anatomy parity
- Per-layer 3D model swap (Skeletal=ribs, Vascular=arterial tree, Conduction=SA/AV/Purkinje highlight)
- 12 individually-clickable cranial nerves
- Disease overlay for brain (stroke ischemia spread, AD atrophy)
- Voice commands in AR/VR

### P2
- Clinical scenario simulator with branching cases
- ECG interpretation game (read the strip → diagnose)
- Class Mode for instructors (join code + scoped leaderboard)
- OSCE station library

### P3
- Lungs, kidneys, liver expansion
- Histology slide viewer (zoom into tissue level)
- CT/MRI gallery

## Memory
- Test credentials: `/app/memory/test_credentials.md`
- Auth playbook: `/app/auth_testing.md`
- Design guidelines: `/app/design_guidelines.json`
- EMERGENT_LLM_KEY in `/app/backend/.env`

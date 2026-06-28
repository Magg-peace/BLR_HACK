# Anatomia AI — PRD

## Vision
Cinematic AI-powered medical education platform — Heart + Brain — inspired by Complete Anatomy, BioDigital Human and Apple Vision Pro.

## Stack
React 19 (CRA) · Tailwind · shadcn/ui · Framer Motion · @react-three/fiber 9 · @react-three/drei 10 · @react-three/postprocessing · @react-three/xr 6 · FastAPI · Motor (MongoDB) · Emergent Universal LLM Key (Gemini 3 Flash + OpenAI TTS).

## User Choices
- Auth: Emergent Google OAuth
- AI Tutor: Gemini 3 Flash
- Narration: OpenAI TTS (tts-1) with Web Speech fallback
- 3D: Hybrid R3F (composite anatomical meshes)

## Implemented

### v0.1 — MVP
Landing, persona selection, OAuth, dashboard, Heart + Brain explorers, Disease Lab, Compare, Learning Hub.

### v0.2 — Realism + Gamification
Composite anatomical 3D heart + brain, ACES + bloom + vignette postprocessing, Web Speech narration, AI Tutor SSE streaming + persistent history, Quiz Arena (3 quizzes, XP/streak/badges/leaderboard), WebXR AR/VR Lab.

### v0.3 — Immersive Learning Engine
- **OpenAI TTS** narration (`POST /api/tts`): persona→voice mapping (school→nova / med→sage / doctor→onyx), MP3 streaming. NarratorButton tries TTS first, falls back to Web Speech.
- **Live ECG Monitor** in Heart Explorer: animated SVG P/QRS/T waveform tracing left→right at the chosen bpm (40-180), WebAudio-synthesized lub-dub heart sounds (S1/S2 thumps) synced to each beat.
- **Dynamic Tour Engine**: auto-advancing TourPlayer with timed steps, animated blood-particle stream tracing the polyline between hotspots, auto-play TTS narration per step, "Did you know?" fact callouts, progress bar, prev/next/pause controls. Pink particles for heart, purple for brain.
- **Drag-and-drop Pathway Quizzes**: "Build the Blood Flow Pathway" (9 positions) + "Build the Motor Signal Pathway" (6 positions). Submits as quiz → XP/badges.
- **Expanded tour content**: 3 heart tours, 5 brain tours (Memory, Neural Signal, Motor Control, Speech, Emotion) — each step has duration + fact.

## Backend Endpoints (final)
- Auth: `POST /api/auth/session` · `GET /api/auth/me` · `POST /api/auth/logout` · `POST /api/user/persona`
- Tutor: `POST /api/tutor/chat` · `POST /api/tutor/stream` (SSE) · `GET /api/tutor/history` · `DELETE /api/tutor/history`
- Quiz: `POST /api/quiz/submit` · `GET /api/leaderboard` · `GET /api/badges`
- TTS: `POST /api/tts` (audio/mpeg response)

## Tests
- Backend pytest: 38/38 passing (auth + tutor + tutor-stream + history + quiz + badges + leaderboard + TTS)
- Frontend e2e: 100% on critical flows

## Backlog
### P1 — Realism
- Real GLTF medical models (Sketchfab Pro / commissioned)
- In-XR hand-tracking + label callouts (WebXR + @react-three/xr v6 layers)
- Cinematic GSAP camera fly-throughs inside vessels

### P2 — Content depth
- Hotspot quizzes (tap correct structure on the 3D viewport)
- Clinical scenario simulator (branching cases)
- Disease overlay on Heart Explorer (animated plaque growth + ischemia)
- Lungs, kidneys, liver expansion

### P3 — Social / growth
- Share quiz result card (LinkedIn/X auto-image)
- Daily anatomy challenge with global leaderboard
- Class-mode for instructors

## Memory
- Test credentials: `/app/memory/test_credentials.md`
- Auth playbook: `/app/auth_testing.md`
- Design guidelines: `/app/design_guidelines.json`
- EMERGENT_LLM_KEY in `/app/backend/.env`

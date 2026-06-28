# Anatomia AI — PRD

## Vision
A cinematic, AI-powered medical education platform focused on the human Heart and Brain. Inspired by Complete Anatomy, BioDigital Human, National Geographic medical documentaries, and Apple Vision Pro experiences. Premium, immersive, persona-adaptive learning.

## Original Problem Statement (excerpt)
"Build a production-grade web platform called 'Anatomia AI' — interactive 3D anatomy ecosystem with realistic Heart and Brain exploration, disease progression simulation, persona-adaptive narration (school student / medical student / doctor), AI tutor, guided tours, comparison mode, learning hub, and AR/VR-ready architecture."

## User Choices (User Inputs)
- **Auth**: Emergent Google OAuth
- **AI Tutor**: Gemini 3 Flash (default — Emergent Universal LLM key)
- **3D approach**: Hybrid (R3F for explorer hero, illustrations for tour scenes)
- **Scope**: Recommended MVP — Landing + Persona + Heart + Brain + Disease + AI Tutor (defer AR/VR, Quizzes, Gamification XP)
- **Stack**: Template stack (React/CRA + Tailwind + FastAPI + MongoDB + R3F + Framer Motion)

## User Personas
1. **School Student** — simple language, analogies, storytelling
2. **Medical Student** — anatomy + physiology + pathology terminology
3. **Doctor** — clinical insights, diagnostic relevance, treatment

## Architecture
- **Frontend**: React 19 (CRA) + Tailwind + shadcn/ui + Framer Motion + @react-three/fiber 9 + @react-three/drei 10
- **Backend**: FastAPI + Motor (MongoDB) + Emergent Integrations (Gemini 3 Flash)
- **Auth**: Emergent Google OAuth (cookie + Bearer fallback)
- **State**: React Context (AppContext: user, persona, narrationOn)

## Implemented (2026-02 / MVP v0.1)
- Cinematic landing page with R3F 3D heart + brain hero, features grid, adaptive learning band, CTA
- Persona selection (3 cards, persists local + DB)
- Emergent Google OAuth flow (session_id → session_token cookie)
- Dashboard layout: glass sidebar + topbar (persona badge, narration toggle, search, user profile)
- Heart Explorer: pulsing 3D heart, 5 layer toggles, 10 structures with hotspots, persona-aware narration, 3 guided tours
- Brain Explorer: 3D brain, 4 layer toggles, 9 regions with hotspots, 3 guided tours
- Disease Lab: 10 diseases (5 heart, 5 brain), severity slider 4–5 stages each, animated severity overlay, symptoms/causes/risk-factors/treatments/prognosis panels
- AI Tutor (Gemini 3 Flash): persona-aware system prompts, chat UI, suggestion chips, quick topics
- Compare mode: side-by-side viewports, disease selection
- Learning Hub: module cards
- Quiz Arena + AR/VR Lab: announcement placeholders

## Test Coverage
- Backend pytest: 13/13 passing (auth, persona, tutor)
- Frontend manual + testing agent: all critical flows pass (~95%)

## Backlog (Next phases)
### P1 — Depth
- Real GLTF/GLB heart + brain models (Sketchfab CC0 or commissioned) replacing procedural geometry
- Streaming responses for AI Tutor (SSE)
- Persistent chat history per user in MongoDB
- Cross-section / explode-view controls in 3D viewers
- Heartbeat ECG mini-graph + audio narration via OpenAI TTS

### P2 — Gamification & assessment
- Quiz Arena: MCQ + hotspot quizzes (persona-adaptive difficulty)
- XP / streaks / badges
- Daily challenges
- Leaderboard

### P3 — Immersive
- WebXR AR (place organs in room via WebXR Device API)
- VR anatomy lab with hand controllers (Quest 3 support)
- Multi-user co-exploration (LiveKit / WebRTC)

### P4 — Content expansion
- Add Lungs, Kidneys, Liver, Skeletal
- Histology / cellular zoom
- Imaging gallery (CT, MRI annotated)
- Clinical case library with branching scenarios

## Notes
- EMERGENT_LLM_KEY configured in /app/backend/.env
- Test session: see /app/memory/test_credentials.md
- Auth testing playbook: /app/auth_testing.md
- Design guidelines: /app/design_guidelines.json

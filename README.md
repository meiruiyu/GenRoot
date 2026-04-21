# GenRoot — Family Memory Preservation Platform

[中文版](README.zh.md)

> Capture fading voices before they disappear forever.

GenRoot is an AI-powered platform that helps families preserve intergenerational stories as audio memories — then optionally share them as living cultural heritage on a public map.

**Live Demo:** [Watch on Google Drive](https://drive.google.com/file/d/1oR3q_yE8zME4gVeoz6HbHzn_z90sKbB9/view?usp=sharing)

---

## The Problem

Elderly relatives carry irreplaceable memories — folk songs, migration stories, craft traditions — but modern family members often lack a natural, low-friction way to capture them. GenRoot makes the recording process feel like a conversation, not an interview.

---

## Key Features

### For Families Recording Stories
- **AI Icebreaker Generation** — Upload a photo or enter a text prompt (e.g. "1990年过年") and the app generates 3 contextual conversation-starter questions to guide the recording
- **Elder-Friendly Recording Studio** — A distraction-free UI: one photo, one question, one large microphone button
- **Real-Time Transcription** — Live speech-to-text via MiniMax Realtime API with Web Speech API fallback
- **Full AI Processing Pipeline** — After recording: automatic transcription, Chinese → English translation, 2–3 sentence summary, and named entity extraction (people, locations, years, events)
- **Privacy Controls** — Three levels: `private` (family only), `family` (shared within family), `public` (published to the culture map with auto-anonymization)
- **Memory Archive** — Personal timeline of all saved memories with audio playback and AI-generated metadata

### For Cultural Explorers
- **Interactive Culture Map** — Mapbox-powered map showing geolocated public family stories, clustered by heritage type (craft, ritual, person, place)
- **Filter & Discover** — Browse by cultural tag, story type, or region (Guizhou, Guangdong, New York, etc.)

### Family Knowledge Chat
- **Ask Family** — A chat interface grounded in the memory archive. Ask questions like "What does Grandma's migration story mean?" and get context-aware answers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, styled-components |
| Maps | Mapbox GL JS |
| Family Tree | react-family-tree, ReactFlow |
| AI / Speech | MiniMax API (ASR, translation, summarization, NER) |
| Backend | FastAPI (Python), SQLAlchemy, SQLite |
| HTTP | Axios, httpx (async) |

---

## Project Structure

```
genRoot/
├── frontend/                  # Next.js 14 app
│   └── src/
│       ├── app/               # Pages & API routes
│       │   ├── page.tsx       # Home
│       │   ├── create/        # Memory trigger (photo/text → icebreakers)
│       │   ├── record/        # Recording studio
│       │   ├── archive/       # Personal memory timeline
│       │   ├── explore/       # Public culture map
│       │   ├── ask-family/    # Family knowledge chat
│       │   ├── memories/[id]/ # Memory detail view
│       │   └── api/ai/        # Server-side AI routes
│       │       ├── icebreakers/
│       │       ├── transcribe/
│       │       ├── enrich/
│       │       ├── ask/
│       │       ├── tts/
│       │       └── public-version/
│       ├── components/        # React UI components
│       └── lib/               # Types, storage, demo data, AI provider
│
├── backend/                   # FastAPI server
│   ├── main.py
│   ├── api/routes/            # users, family_trees, stories, photos
│   ├── models/                # SQLAlchemy ORM
│   ├── schemas/               # Pydantic validation
│   └── services/              # MiniMax API wrapper
│
└── uploads/                   # Audio & photo storage
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [MiniMax API key](https://www.minimaxi.com/) (optional — app runs with mock data without it)
- A [Mapbox access token](https://mapbox.com/) (for the Explore map)

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables

**`frontend/.env.local`**
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...
MINIMAX_API_KEY=sk-...
MINIMAX_GROUP_ID=...
```

**`backend/.env`**
```env
MINIMAX_API_KEY=sk-...
MINIMAX_API_BASE=https://api.minimax.io/v1
DATABASE_URL=sqlite:///./test.db
```

---

## User Flow

```
Home
 └─ Create Memory
      ├── Upload photo or enter text prompt
      └── AI generates 3 icebreaker questions
           └─ Select a question → Recording Studio
                ├── Record audio (real-time transcription)
                └── AI Process
                     ├── Transcript + Translation
                     ├── Summary + Entities
                     └── Set privacy → Save
                          ├── Archive  (personal timeline)
                          ├── Explore  (public culture map)
                          └── Ask Family (knowledge chat)
```

---

## Scripts

```bash
# Frontend
npm run dev       # Development server
npm run build     # TypeScript check + production build
npm run start     # Production server
npm run lint      # ESLint

# Backend
uvicorn backend.main:app --reload   # Development server
```

---

## Design Principles

- **Elder-first UI** — The recording screen is deliberately minimal. Large tap targets, no navigation clutter, no decisions required.
- **Privacy by default** — Memories are private unless the user explicitly chooses to share. Public versions are auto-anonymized before publishing.
- **AI as assistant, not gatekeeper** — Every AI-generated field (transcript, summary, entities) is visible and editable before saving.

---

## Demo Walkthrough

1. `/` — Home page
2. `/create` — Type "1990年过年" or upload a family photo → generate icebreaker questions
3. Select a question → `/record`
4. Record 10–15 seconds of audio → Preview → click **AI Process**
5. Review transcript, translation, summary, and extracted entities
6. Confirm save
7. `/archive` — See the memory in your personal timeline
8. `/explore` — Browse the public culture map
9. `/ask-family` — Chat about the stories in the archive

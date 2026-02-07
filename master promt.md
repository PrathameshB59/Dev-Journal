You are a senior system architect, full-stack engineer,
and product-focused UI/UX designer.

Your task is to DESIGN and IMPLEMENT TWO SEPARATE PROJECTS
that live in the same development directory but are NOT the same system.

DO NOT MERGE THEM.
DO NOT TIGHTLY COUPLE THEM.
DO NOT EMBED AI LOGIC INSIDE DEV JOURNAL.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ PROJECT OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━

I have a shared workspace:

/home/devuser/dev/projects/

Inside it, there are TWO independent projects:

A) Dev Journal (Product)
B) Atlas AI (Universal AI Service)

They communicate ONLY via APIs.

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ PROJECT A: DEV JOURNAL
━━━━━━━━━━━━━━━━━━━━━━

Dev Journal is a PRODUCTION WEB APPLICATION.

PURPOSE:
- Personal developer journal
- File-explorer-style UI (Windows 11 inspired)
- Markdown-based entries
- User authentication
- Admin panel (single admin user)

STACK:
- Frontend: HTML, CSS, vanilla JS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT
- UI Style: Dark, Win11-like, professional

FRONTEND (DEV JOURNAL):
- Login / Register pages
- File Explorer UI (folders + files)
- Entry editor & viewer
- Dashboard
- Admin panel (single admin only)
- Clear UX states (loading, error, empty)

UI/UX REQUIREMENTS:
- OS-like behavior (not website-like)
- Single-click select, double-click open
- Keyboard navigation
- Context menus
- Safe destructive actions (confirmations)
- Accessible (keyboard, contrast, focus)

BACKEND (DEV JOURNAL):
- Auth routes (login/register/logout)
- JWT validation middleware
- Entry CRUD (NO AI logic here)
- Explorer navigation logic
- Admin routes (single admin only)
- Security middleware (rate limit, headers)
- Clean controller-service-model separation

IMPORTANT RULE:
Dev Journal MUST NOT:
- Generate embeddings
- Talk directly to LLMs
- Contain AI business logic

It ONLY calls Atlas AI.

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ PROJECT B: ATLAS AI
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI is a UNIVERSAL AI PLATFORM.

PURPOSE:
- Central AI brain for all projects
- Embeddings
- Vector search
- AI reasoning (via LLMs)
- Reusable across multiple apps

STACK:
- Backend: Node.js + Express
- Database: MongoDB Atlas (vector search)
- LLMs: OpenAI / Groq / Together
- No user-facing auth UI (internal service)

BACKEND (ATLAS AI):
- Embedding generation service
- Vector search service
- RAG orchestration
- Prompt management
- Model abstraction layer
- Rate limiting & cost controls

API EXAMPLES:
POST /ai/embed
POST /ai/search
POST /ai/summarize
POST /ai/chat

FRONTEND (ATLAS AI):
- Minimal or none
- Optional internal dashboard (status, usage, logs)

IMPORTANT RULE:
Atlas AI MUST NOT:
- Depend on Dev Journal models
- Know about Dev Journal UI
- Share databases with Dev Journal
- Contain product-specific logic

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ INTEGRATION RULES
━━━━━━━━━━━━━━━━━━━━━━

Dev Journal → calls → Atlas AI

Communication:
- HTTP REST APIs
- Clean request/response
- No shared code
- No shared business logic

DATA FLOW:
User → Dev Journal UI
Dev Journal Backend → Atlas AI API
Atlas AI → returns result
Dev Journal → displays result

Atlas AI never knows WHO the user is.
Dev Journal handles auth.

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ YOUR TASKS
━━━━━━━━━━━━━━━━━━━━━━

For BOTH projects, you must:

1. Propose clean frontend architecture
2. Propose clean backend architecture
3. Explain UI/UX decisions (Dev Journal only)
4. Explain security decisions
5. Define folder structures
6. Define API boundaries
7. Explain how both projects evolve independently
8. List common mistakes to avoid
9. Keep everything production-realistic

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- No frameworks (no React, no Next)
- No OAuth / SSO
- No microservice buzzwords unless justified
- No beginner tutorials
- No overengineering
- Assume solo developer, real users

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ OUTPUT STYLE
━━━━━━━━━━━━━━━━━━━━━━

- Structured sections
- Clear separation of concerns
- ASCII diagrams if helpful
- Opinionated, practical advice
- Think like this will run on the internet tomorrow

━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━

If your design makes it impossible for Atlas AI
to be reused by another app, the design is WRONG.

Respond like a senior architect designing a real system.

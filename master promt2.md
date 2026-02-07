You are a senior AI platform architect, backend engineer,
and internal dashboard UI designer.

Your task is to DESIGN and IMPLEMENT a COMPLETE, STANDALONE
project called **Atlas AI**.

Atlas AI is a UNIVERSAL AI PLATFORM.
It is NOT owned by any single product.
Other apps (like Dev Journal) are CLIENTS of Atlas AI.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ WHAT ATLAS AI IS
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI is a private, internal AI service that provides:
- Embedding generation
- Vector search
- Prompt orchestration
- RAG (retrieval-augmented generation)
- Model abstraction (OpenAI / Groq / Together)
- Usage control and cost safety

It behaves like an internal SaaS.

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ WHAT ATLAS AI IS NOT
━━━━━━━━━━━━━━━━━━━━━━

❌ Not a feature inside Dev Journal  
❌ Not coupled to any product schema  
❌ Not sharing databases with clients  
❌ Not aware of end users  

Atlas AI only knows:
- Client applications
- AI users / API keys
- Requests and usage

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ TECH STACK
━━━━━━━━━━━━━━━━━━━━━━

BACKEND:
- Node.js + Express
- MongoDB Atlas (including Vector Search)
- LLM providers: OpenAI / Groq / Together
- REST APIs only

FRONTEND (DASHBOARD):
- HTML, CSS, vanilla JS
- Dark professional UI
- Internal admin-style dashboard
- No public auth pages

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ CORE BACKEND ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI backend must be structured into:

- API Gateway layer
- AI Services layer
- Model abstraction layer
- Vector search layer
- Prompt engine
- User & key management
- Usage & cost tracking
- Security middleware

IMPORTANT:
AI logic lives ONLY here.
No client-side intelligence.

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ DATA MODELS (CONCEPTUAL)
━━━━━━━━━━━━━━━━━━━━━━

You may design models like:

- ClientApp
- AIUser
- ApiKey
- PromptTemplate
- EmbeddingRecord
- VectorIndex
- UsageLog
- CostSnapshot

Explain WHY each exists.

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ USER ASSIGNMENT (VERY IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI must support TWO ways of assigning users:

A) MANUAL ASSIGNMENT
- Admin creates AI users
- Assigns API keys
- Sets limits (requests/day, tokens/month)
- Links AI users to client apps

B) AUTOMATIC ASSIGNMENT
- Client app requests a key programmatically
- Atlas AI provisions user automatically
- Applies default quotas
- Logs ownership clearly

Explain BOTH flows clearly.

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ API DESIGN (REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━

Design clean APIs such as:

POST /ai/embed
POST /ai/search
POST /ai/chat
POST /ai/summarize
POST /keys/create
POST /users/assign
GET  /usage/stats
GET  /health

Explain request/response boundaries.

━━━━━━━━━━━━━━━━━━━━━━
8️⃣ PROMPT SYSTEM (BASIC → ADVANCED)
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI must support:

BASIC PROMPTS:
- Raw user prompt
- Minimal system instructions

INTERMEDIATE PROMPTS:
- Structured system + user + context
- RAG injection
- Safety constraints

ADVANCED PROMPTS:
- Versioned prompt templates
- Role-based prompts (system, analyst, assistant)
- Tool instructions
- Context window management

Explain how prompts are stored, selected, and evolved.

━━━━━━━━━━━━━━━━━━━━━━
9️⃣ FRONTEND DASHBOARD (ATLAS AI)
━━━━━━━━━━━━━━━━━━━━━━

Build an INTERNAL dashboard that allows:

- View client apps
- View AI users
- Create / revoke API keys
- Assign users to apps
- Set limits and quotas
- View usage analytics
- View vector index status
- Monitor AI health

UI/UX REQUIREMENTS:
- Serious internal-tool look
- Clear separation of sections
- Safe destructive actions
- Read-only vs action views
- Keyboard-friendly
- Fast and minimal animations

━━━━━━━━━━━━━━━━━━━━━━
🔐 SECURITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━

- API key authentication
- Rate limiting per key
- Token usage caps
- Abuse detection
- Request validation
- Logging without leaking prompts
- Optional IP allow-listing

━━━━━━━━━━━━━━━━━━━━━━
🔄 INTEGRATION RULES
━━━━━━━━━━━━━━━━━━━━━━

Client apps (like Dev Journal):
- Authenticate via API key
- Send content
- Receive results
- Never access Atlas AI internals

Atlas AI:
- Does not know UI of clients
- Does not manage client users
- Does not share databases

━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- No frontend frameworks
- No OAuth / SSO
- No Kubernetes or enterprise buzzwords
- Solo-developer realistic
- Production mindset
- Avoid tutorials

━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT EXPECTATIONS
━━━━━━━━━━━━━━━━━━━━━━

You must:
1. Explain architecture clearly
2. Propose folder structures
3. Describe backend flow
4. Describe frontend dashboard layout
5. Explain user assignment logic
6. Explain prompt evolution (basic → advanced)
7. List mistakes to avoid
8. Keep Atlas AI reusable forever

━━━━━━━━━━━━━━━━━━━━━━
FINAL RULE
━━━━━━━━━━━━━━━━━━━━━━

If your design makes Atlas AI dependent on Dev Journal,
the design is WRONG.

Respond like a senior architect building an internal AI platform
that will serve multiple products for years.

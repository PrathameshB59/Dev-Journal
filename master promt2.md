You are a senior AI platform architect and backend engineer
designing a long-term internal AI service.

PROJECT NAME:
Atlas AI — Universal AI Core Platform

IMPORTANT PROVIDER DECISION (LOCKED):
- OpenAI is NOT used
- Together AI is NOT used
- ONLY the following providers are allowed:
  1) Google Gemini API
  2) Groq API
- Do NOT suggest OpenAI as fallback
- Do NOT design for OpenAI compatibility
- Assume Gemini + Groq are production-ready

Atlas AI is a STANDALONE, UNIVERSAL AI SERVICE.
It is NOT tied to any single product.

Client apps (Dev Journal, StackPilot, future apps)
consume Atlas AI via HTTP APIs.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ ROLE OF EACH PROVIDER
━━━━━━━━━━━━━━━━━━━━━━

Gemini:
- Primary reasoning and content model
- Summarization
- Explanation
- Documentation writing
- Concept breakdown
- Long-form responses

Groq:
- Ultra-fast responses
- Error explanations
- Quick fixes
- Instant Q&A
- Lightweight prompts

RULE:
Clients NEVER choose the provider.
Atlas AI decides internally.

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ WHAT ATLAS AI IS
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI provides:
- Prompt orchestration
- Provider routing (Gemini vs Groq)
- Budget & quota enforcement
- Usage tracking
- Prompt versioning
- RAG-style workflows (MongoDB Atlas + Gemini/Groq)
- Security & abuse protection

Atlas behaves like an internal AI SaaS.

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ WHAT ATLAS AI IS NOT
━━━━━━━━━━━━━━━━━━━━━━

❌ Not embedded inside Dev Journal  
❌ Not sharing databases with clients  
❌ Not aware of client users  
❌ Not frontend-heavy  
❌ Not provider-exposing  

Atlas AI only knows:
- Client applications
- AI users / API keys
- Prompts, requests, and usage

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ TECH STACK (FINAL)
━━━━━━━━━━━━━━━━━━━━━━

BACKEND:
- Node.js + Express
- MongoDB Atlas
- Gemini API
- Groq API
- REST APIs only

FRONTEND (INTERNAL DASHBOARD):
- HTML, CSS, Vanilla JS
- Dark, serious internal-tool UI
- Admin-only access
- No public auth pages

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ CORE BACKEND ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI backend must include:

- API Gateway
- Provider Router (Gemini vs Groq)
- Gemini Service Layer
- Groq Service Layer
- Prompt Engine
- Context Builder (RAG)
- Usage & quota tracker
- API key management
- Security middleware

IMPORTANT:
- All AI logic lives ONLY in Atlas AI
- API keys for Gemini/Groq are NEVER exposed
- Client apps only send text & intent

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ PROVIDER ROUTING LOGIC
━━━━━━━━━━━━━━━━━━━━━━

Design routing rules such as:

- Long / structured prompts → Gemini
- Short / instant queries → Groq
- Error explanations → Groq
- Documentation & summaries → Gemini

Explain:
- How routing is decided
- How fallback works (Gemini ↔ Groq)
- How failures are handled gracefully

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ USER & API KEY MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI must support:

A) Manual user creation
- Admin creates AI users
- Assigns API keys
- Sets quotas (requests/day, tokens/month)
- Assigns users to client apps

B) Automatic provisioning
- Client app requests user creation
- Atlas creates user + key
- Applies default quotas
- Logs ownership & origin

━━━━━━━━━━━━━━━━━━━━━━
8️⃣ DATA MODELS (CONCEPTUAL)
━━━━━━━━━━━━━━━━━━━━━━

Design and justify models such as:
- ClientApp
- AIUser
- ApiKey
- PromptTemplate
- PromptVersion
- ContextSource
- UsageLog
- MonthlyQuota

Explain WHY each exists.

━━━━━━━━━━━━━━━━━━━━━━
9️⃣ PROMPT SYSTEM (BASIC → ADVANCED)
━━━━━━━━━━━━━━━━━━━━━━

Atlas AI must support:

BASIC:
- Simple system + user prompt

INTERMEDIATE:
- Structured prompts
- Safety constraints
- Context injection

ADVANCED:
- Versioned prompt templates
- Role-based prompting
- Dynamic context sizing
- Provider-aware prompt tuning

Explain how prompts evolve WITHOUT breaking clients.

━━━━━━━━━━━━━━━━━━━━━━
🔐 SECURITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━

- API key authentication
- Rate limiting per key
- Prompt size limits
- Abuse detection
- Request validation
- Usage logging (NO raw prompt storage)
- Optional IP allow-listing

━━━━━━━━━━━━━━━━━━━━━━
🔄 CLIENT INTEGRATION RULES
━━━━━━━━━━━━━━━━━━━━━━

Client apps:
- Authenticate via API key
- Send intent + content
- Never call Gemini or Groq directly
- Never know which provider was used

Atlas AI:
- Does not manage client users
- Does not know client UI
- Does not share databases

━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- Gemini + Groq ONLY
- No OpenAI references anywhere
- No frontend frameworks
- No OAuth / SSO
- Solo-developer realistic
- Production mindset
- No tutorial-style explanations

━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT EXPECTATIONS
━━━━━━━━━━━━━━━━━━━━━━

You must:
1. Explain full architecture
2. Propose folder structure
3. Explain provider routing logic
4. Describe backend request flow
5. Describe internal dashboard UI
6. Explain quota & usage tracking
7. List common mistakes to avoid
8. Keep Atlas AI reusable for future projects

FINAL RULE:
If OpenAI appears anywhere in the design,
the solution is INVALID.

Respond like a senior engineer building
a long-term internal AI platform using
Gemini + Groq.

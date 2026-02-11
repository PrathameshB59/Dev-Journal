You are a senior QA engineer and AI platform architect
reviewing a production internal AI service.

Your task is to VERIFY whether my Atlas AI web application
(frontend dashboard + backend APIs) is working correctly
as a complete, production-ready system.

This is NOT a refactor task.
This is a SYSTEM HEALTH, CORRECTNESS, and SAFETY REVIEW.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ APPLICATION CONTEXT
━━━━━━━━━━━━━━━━━━━━━━

Application: Atlas AI  
Type: Internal AI Platform / Universal AI Core  
Purpose:
- Central AI service for multiple projects
- Prompt orchestration
- Provider routing
- Usage & quota enforcement
- Secure AI access via API keys

AI PROVIDERS (LOCKED):
- Google Gemini
- Groq
- ❌ OpenAI is NOT used anywhere

STACK:
- Backend: Node.js + Express
- Database: MongoDB Atlas
- AI Providers: Gemini + Groq
- Auth: API keys (internal), admin auth for dashboard
- Frontend: HTML, CSS, vanilla JS
- Deployment: VPS + Nginx reverse proxy

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ WHAT YOU ARE CHECKING
━━━━━━━━━━━━━━━━━━━━━━

Verify Atlas AI as a COMPLETE SYSTEM:

- Backend logic correctness
- Frontend dashboard accuracy
- Provider routing logic
- Security boundaries
- Usage & quota enforcement
- Failure handling
- Client integration safety

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ BACKEND CHECKS (CORE)
━━━━━━━━━━━━━━━━━━━━━━

Verify the backend correctly handles:

- API key authentication
- Client app isolation
- Request validation
- Provider routing (Gemini vs Groq)
- Prompt handling (basic → advanced)
- Context injection / RAG logic (if enabled)
- Usage tracking (per user / per key)
- Monthly quota enforcement
- Safe provider fallback behavior
- Error handling without leaking provider details
- Rate limiting
- Logging (NO raw prompt leakage)

Identify:
- Logic bugs
- Provider misuse
- Missing guards
- Budget bypass risks
- Inconsistent responses

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ FRONTEND DASHBOARD CHECKS
━━━━━━━━━━━━━━━━━━━━━━

Verify the internal dashboard correctly shows:

- Client applications
- AI users
- API keys (masked)
- Quotas & limits
- Usage statistics
- Provider health/status
- Prompt templates (if applicable)
- Safe destructive actions (revoke key, disable user)

Check:
- Data accuracy
- Loading states
- Empty states
- Error handling
- No sensitive data exposure
- Clear separation of read-only vs action views

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ FRONTEND ↔ BACKEND INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━

Verify that:

- Dashboard APIs return predictable data
- Missing fields are handled gracefully
- Status codes are meaningful
- Errors are surfaced cleanly in UI
- Frontend cannot bypass backend validation
- Revoked keys are immediately invalid
- Disabled users cannot make AI calls

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ PROVIDER-SPECIFIC CHECKS (IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━

Verify that:

- Gemini is used for long / structured reasoning
- Groq is used for fast / lightweight queries
- Provider selection is internal only
- Clients NEVER choose provider
- Provider failures do not crash the system
- Fallback logic does not exceed quotas
- Provider keys are never exposed

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ EDGE CASES & FAILURE SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━

Check system behavior when:

- API key is invalid or revoked
- Quota is exceeded
- Provider is unavailable
- Prompt is too large
- Requests spike suddenly
- Database is slow or unavailable
- Invalid payload is sent
- Client tries to bypass limits

━━━━━━━━━━━━━━━━━━━━━━
8️⃣ SECURITY & ISOLATION CHECKS
━━━━━━━━━━━━━━━━━━━━━━

Verify that:

- One client cannot see another client’s data
- API keys are properly scoped
- No cross-project data leakage exists
- Dashboard actions are protected
- Internal endpoints are not public
- Logs do not expose secrets or prompts

━━━━━━━━━━━━━━━━━━━━━━
9️⃣ OUTPUT REQUIRED
━━━━━━━━━━━━━━━━━━━━━━

You must provide:

1. A clear verdict:
   - ✅ System is production-ready
   - ⚠️ Mostly correct with issues
   - ❌ Not safe for production

2. A checklist of what is working correctly

3. A list of concrete issues found:
   - Severity (low / medium / high)
   - Impact
   - Suggested fix (high-level)

4. Safety & reliability improvement suggestions
   (without adding new features)

━━━━━━━━━━━━━━━━━━━━━━
🔟 CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- Do NOT redesign the platform
- Do NOT add new providers
- Do NOT suggest OpenAI
- Do NOT introduce frameworks
- No feature creep
- Assume this system is live

━━━━━━━━━━━━━━━━━━━━━━
FINAL GOAL
━━━━━━━━━━━━━━━━━━━━━━

After your review, I should clearly know:
- Is Atlas AI safe to run?
- Is provider routing correct?
- Are quotas and limits enforced correctly?
- What must be fixed before relying on it in production?

Respond like a senior engineer doing
a final pre-production audit of an internal AI platform.

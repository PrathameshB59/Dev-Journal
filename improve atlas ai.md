You are a senior full-stack engineer, SaaS product designer,
and accessibility specialist reviewing a production internal platform.

PROJECT:
Atlas AI – Universal AI Core Platform (Internal Tool)

CURRENT STATE:
Atlas AI is already working with:
- Clients management
- API Keys management
- Usage & cost tracking
- Provider routing (Gemini + Groq)
- Admin-only dashboard
- Dark UI
- Node.js + Express backend
- MongoDB Atlas
- Vanilla HTML, CSS, JS frontend

The system is FUNCTIONAL.
This task is to IMPROVE it, not rewrite it.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ GOALS OF THIS REVIEW
━━━━━━━━━━━━━━━━━━━━━━

Improve Atlas AI in terms of:
- Feature depth (useful, not bloated)
- Dashboard layout & clarity
- Responsiveness (desktop → tablet → mobile)
- Accessibility (WCAG-level thinking)
- Frontend–backend contract quality
- Operational visibility & safety

Treat Atlas AI as a real internal SaaS
used daily by a solo developer.

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ FRONTEND (UI / UX) IMPROVEMENTS
━━━━━━━━━━━━━━━━━━━━━━

Review and propose improvements for:

A) Dashboard layout & hierarchy
- What should be visible immediately
- What can be secondary or collapsible
- Better card grouping and spacing
- Clear visual priority for:
  - spend
  - health
  - requests
  - limits

B) Navigation & flow
- Sidebar clarity
- Active state visibility
- Faster access to common actions
- Safer destructive actions (delete, revoke)

C) Responsiveness
- Desktop-first, but usable on:
  - tablet
  - mobile
- Sidebar collapse behavior
- Tables on small screens
- Touch-friendly interactions

D) Accessibility
- Keyboard navigation
- Focus indicators
- Color contrast
- Screen-reader friendly labels
- ARIA roles where appropriate
- No reliance on color alone

E) States
- Loading states
- Empty states
- Error states
- Disabled states
- Confirmation states

NO frameworks.
Vanilla JS, existing CSS, incremental changes only.

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ BACKEND IMPROVEMENTS (LOGIC & DATA)
━━━━━━━━━━━━━━━━━━━━━━

Review backend logic and suggest improvements for:

A) Dashboard data aggregation
- Efficient queries
- Avoid duplicate calculations
- Monthly usage grouping
- Fast recent activity fetch

B) Usage & cost accuracy
- Provider cost consistency
- Rounding rules
- Month boundary handling
- Timezone correctness

C) Safety & correctness
- API key revocation behavior
- Client disable behavior
- Budget enforcement guarantees
- Idempotent admin actions

D) API design quality
- Consistent response shapes
- Predictable error codes
- Partial failure handling
- Clear separation of read vs write APIs

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ FRONTEND ↔ BACKEND CONTRACT
━━━━━━━━━━━━━━━━━━━━━━

Verify and improve:
- API response consistency
- Required vs optional fields
- Safe defaults
- Backward compatibility
- Dashboard resilience when data is missing

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ FEATURE ENHANCEMENTS (CONTROLLED)
━━━━━━━━━━━━━━━━━━━━━━

Suggest ONLY high-value features such as:
- Better usage insights
- Provider health indicators
- Budget warnings
- Trend indicators
- Audit visibility

DO NOT:
- Add chat UIs
- Add public user auth
- Add new AI providers
- Over-engineer

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ SECURITY & OPERATIONAL VISIBILITY
━━━━━━━━━━━━━━━━━━━━━━

Review:
- Sensitive data exposure in UI
- Logging safety
- Admin action traceability
- Safe defaults
- Rate-limit visibility

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- Gemini + Groq ONLY
- No OpenAI references
- No frameworks
- No redesign from scratch
- Solo-developer realistic
- Production mindset
- Internal tool tone (not marketing)

━━━━━━━━━━━━━━━━━━━━━━
8️⃣ OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━

Respond with:
1. High-level critique
2. Frontend UI/UX improvement checklist
3. Backend logic improvement checklist
4. Accessibility improvements list
5. Responsiveness recommendations
6. Feature additions (shortlist only)
7. Common internal-dashboard mistakes to avoid

FINAL RULE:
Treat Atlas AI as a critical internal service
that must remain stable, predictable, and boring
—in a good way.

Perfect 👍
What you want now is ONE solid “system health & correctness” prompt that you can give to Claude AI so it reviews Dev Journal as a working product, not as code snippets.

Below is a copy-paste ready prompt that tells Claude to behave like a QA lead + senior full-stack engineer and verify frontend + backend integration, flows, and edge cases.

✅ Claude AI Prompt — Dev Journal Full System Check (Frontend + Backend)
You are a senior QA engineer and full-stack architect
reviewing a production web application.

Your task is to VERIFY whether my Dev Journal web app
(frontend + backend) is working correctly as a complete system.

This is NOT a refactor task.
This is a SYSTEM HEALTH & CORRECTNESS REVIEW.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ APPLICATION CONTEXT
━━━━━━━━━━━━━━━━━━━━━━

Application: Dev Journal  
Type: Production web app  
Purpose:
- Personal developer journal
- File-explorer-style UI
- Markdown-based entries
- Single admin system
- AI handled externally (Atlas AI)

STACK:
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT
- UI Style: Dark, Windows 11–inspired

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ WHAT YOU ARE CHECKING
━━━━━━━━━━━━━━━━━━━━━━

Check BOTH frontend and backend working together.

You must verify:
- User flows
- Data flows
- Auth flows
- Error handling
- State consistency
- Security basics
- UX correctness

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ FRONTEND CHECKS
━━━━━━━━━━━━━━━━━━━━━━

Verify the frontend correctly handles:

- Login & register flow
- JWT handling (login, logout, session expiry)
- Protected routes
- File Explorer behavior:
  - Folder navigation
  - Single-click select
  - Double-click open
  - Context menu
  - Breadcrumb updates
- Entry creation, edit, delete
- Empty states
- Loading states
- Error messages (non-leaking)
- Keyboard navigation
- UI state consistency after refresh
- Accessibility basics (focus, contrast)

Identify:
- Broken flows
- UX confusion
- State mismatches
- Silent failures

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ BACKEND CHECKS
━━━━━━━━━━━━━━━━━━━━━━

Verify the backend correctly handles:

- Auth routes (login/register/logout)
- Password hashing & validation
- JWT verification middleware
- Route protection
- Entry CRUD logic
- Explorer navigation APIs
- Admin-only routes
- Input validation
- Error responses
- Rate limiting
- Security headers
- Logging (without leaking secrets)

Identify:
- Logic bugs
- Security gaps
- Missing validations
- Inconsistent responses

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ FRONTEND ↔ BACKEND INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━

Check that:

- API contracts match frontend expectations
- Status codes are handled correctly
- Errors are surfaced properly in UI
- No backend assumptions leak into frontend
- No frontend logic bypasses backend validation
- Unauthorized access is impossible

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ EDGE CASES & FAILURE SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━

Check behavior when:
- Token expires
- User refreshes the page
- Network request fails
- Database is slow or unavailable
- User performs rapid actions
- Invalid input is sent
- Unauthorized user accesses protected routes

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ OUTPUT REQUIRED
━━━━━━━━━━━━━━━━━━━━━━

You must provide:

1. A clear verdict:
   - ✅ Working correctly
   - ⚠️ Mostly correct with issues
   - ❌ Needs fixes

2. A checklist of what is correct

3. A list of concrete issues found
   - Severity (low / medium / high)
   - Impact
   - Suggested fix (high-level)

4. UX improvement suggestions (non-breaking)

━━━━━━━━━━━━━━━━━━━━━━
8️⃣ CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- No rewriting the app
- No adding new features
- No frameworks
- No OAuth suggestions
- No overengineering
- Think like this app is live

━━━━━━━━━━━━━━━━━━━━━━
FINAL GOAL
━━━━━━━━━━━━━━━━━━━━━━

After your review, I should clearly know:
- Is Dev Journal safe to use?
- Is frontend + backend integration solid?
- What must be fixed before production use?

Respond like a senior engineer doing a final pre-production review.

✅ Why this prompt works perfectly

Forces end-to-end thinking

Treats Dev Journal as a real product

Checks frontend + backend together

Catches logic, UX, and security issues

Avoids feature creep

Perfect for “are we good to ship?”
You are a senior security engineer and full-stack architect
reviewing a production authentication system.

I am building a Dev Journal web application with:
- Custom login and registration pages (HTML/CSS/vanilla JS)
- Node.js + Express backend
- MongoDB Atlas database
- JWT-based authentication
- Dark-theme, Windows-11-inspired UI
- No external auth providers (email + password only)

I will describe the CURRENT STATE, then your tasks.

CURRENT FRONTEND (LOGIN & REGISTER):
- Email + password login
- Name (optional) during registration
- Password confirmation field
- Password strength indicator (basic)
- JWT stored in browser (currently localStorage)
- Minimal error messages
- No CAPTCHA yet

CURRENT BACKEND:
- Express.js auth routes
- bcrypt password hashing
- JWT issued on login
- MongoDB user collection
- Basic rate limiting
- Protected routes using auth middleware

GOAL:
Harden the system to production-level security
WITHOUT ruining UX or overengineering.

I want improvements in:
1. Authentication security
2. Abuse prevention
3. Token handling
4. Error handling
5. UI/UX trust signals
6. Accessibility & usability
7. Developer-friendly maintainability

TASKS FOR YOU:

SECURITY REVIEW (BACKEND):
1. Review password handling (hashing, salting, policies)
2. Review JWT usage (storage, expiry, refresh, rotation)
3. Identify missing protections (brute force, enumeration, replay)
4. Suggest safe rate-limit strategies for login/register
5. Recommend secure headers (CSP, HSTS, etc.)
6. Point out any auth anti-patterns
7. Suggest logging & audit practices (without leaking secrets)

FRONTEND SECURITY:
1. Improve form validation (without leaking server rules)
2. Prevent account enumeration via error messages
3. Protect against XSS, CSRF, and clickjacking
4. Suggest safer token storage patterns
5. Improve logout & session invalidation UX

UI / UX IMPROVEMENTS:
1. Make login/register feel trustworthy & professional
2. Improve error states (clear but non-revealing)
3. Improve password feedback without security leaks
4. Suggest micro-interactions that increase confidence
5. Accessibility improvements (keyboard, screen readers)

CONSTRAINTS:
- No OAuth / Google login
- No heavy frameworks
- No CAPTCHA unless truly justified
- Keep it realistic for a solo dev project
- Avoid buzzwords and generic advice
- No beginner explanations

OUTPUT FORMAT:
- Structured sections
- Clear recommendations
- Explain *why* something matters
- Prefer practical trade-offs over perfect security

Respond like you are reviewing a real product that will be exposed to the internet.

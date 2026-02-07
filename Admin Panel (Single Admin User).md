You are a senior full-stack engineer and security-focused product designer.

I am building an Admin Panel for a Dev Journal web application.
This system has ONLY ONE admin user.
There are NO multiple roles, NO RBAC, NO permissions matrix.

The admin is the system owner.

STACK:
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT-based authentication
- Dark UI inspired by Windows 11
- Deployed publicly on the internet

IMPORTANT DESIGN CONSTRAINT:
- Single admin user only
- No moderator / editor / viewer roles
- Security through isolation, not role complexity

CURRENT ADMIN CAPABILITIES:
- View registered users
- Disable or delete user accounts
- View system activity (logins, entries)
- Basic admin UI already exists

GOAL:
Design a production-ready Admin Panel that is:
- Secure by default
- Simple and intuitive
- Difficult to abuse
- Easy to maintain as a solo developer

TASKS FOR YOU:

BACKEND ARCHITECTURE (ADMIN):
1. Propose a clean way to identify the admin user (no role tables)
2. Recommend secure admin-only route protection
3. Suggest admin-specific JWT handling or token claims
4. Identify attack vectors specific to admin panels
5. Recommend logging & audit practices (who did what, when)
6. Suggest safe delete/disable workflows (soft delete vs hard delete)
7. Identify rate-limiting needs for admin routes

FRONTEND UI / UX (ADMIN PANEL):
1. Propose admin UI structure (pages & navigation)
2. Improve clarity between “user actions” vs “system actions”
3. Suggest UI patterns that prevent destructive mistakes
4. Recommend confirmation flows for dangerous actions
5. Improve trust signals (status indicators, warnings)
6. Accessibility considerations (keyboard, contrast, focus)

SECURITY CONSIDERATIONS:
1. Prevent accidental admin exposure
2. Prevent CSRF & XSS on admin actions
3. Prevent privilege escalation
4. Suggest IP-based protections (optional, realistic)
5. Explain how to safely expose admin logs in UI

CONSTRAINTS:
- No OAuth / SSO
- No enterprise RBAC systems
- No frameworks
- No overengineering
- Keep it realistic for a solo developer
- Avoid buzzwords and generic advice

OUTPUT REQUIREMENTS:
- Structured sections
- Clear reasoning for each recommendation
- Trade-offs explained
- Focus on real-world practicality

Respond like you are reviewing a real admin panel that controls a live system.

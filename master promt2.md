Atlas AI Dashboard — Full Improvement Plan
Context
Per improve atlas ai.md and master prompt2.md: Atlas AI dashboard needs frontend + backend improvements. Critical issue: frontend still references "OpenAI" in multiple places (must be Gemini + Groq ONLY). Beyond that, the dashboard needs better UX states, responsiveness, accessibility, budget warnings, and provider health visibility.

Constraints: Gemini + Groq only. No frameworks. Vanilla JS/CSS. Incremental improvements. Dark UI.

Phase 1: Critical — Remove All OpenAI References
1a. overview.js (lines 28, 63, 67)
Path: /home/devuser/dev/projects/atlas-ai/frontend/js/pages/overview.js

Line 28: month.openaiUsd → month.geminiUsd
Line 63: .cost-bar-fill openai → .cost-bar-fill gemini
Line 67: OpenAI $${(month.openaiUsd... → Gemini $${(month.geminiUsd...
1b. usage.js (lines 57, 67, 96)
Path: /home/devuser/dev/projects/atlas-ai/frontend/js/pages/usage.js

Line 57: Column label "OpenAI" → "Gemini", r.openaiUsd → r.geminiUsd
Line 67: r.openaiUsd → r.geminiUsd (spend bar)
Line 96: Badge 'OpenAI' → 'Gemini', badge-info → badge-warning
1c. clients.js (line 124)
Path: /home/devuser/dev/projects/atlas-ai/frontend/js/pages/clients.js

Line 124: allowedProviders: ["openai", "groq"] → ["gemini", "groq"]
1d. styles.css (line 479)
Path: /home/devuser/dev/projects/atlas-ai/frontend/css/styles.css

Line 479: .cost-bar-fill.openai → .cost-bar-fill.gemini
Change color to var(--warning) (amber for Gemini, green stays for Groq)
Phase 2: Frontend UI/UX Improvements
2a. Loading States — Spinners
Files: styles.css, all page JS files

Add to styles.css:


.loading-spinner { display:inline-block; width:16px; height:16px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.loading-inline { display:flex; align-items:center; gap:8px; color:var(--text-secondary); padding:1rem 0; }
Replace Loading... in all pages with <div class="loading-inline"><span class="loading-spinner"></span> Loading...</div>

2b. Budget Warnings on Overview
File: overview.js

Show warning bar when spend >= 80% of budget. Read budget from new budgetLimits field in stats response (Phase 3a).

2c. Provider Health Display
File: overview.js

Show individual provider configured status using new /health response (Phase 3b).

2d. Responsive Sidebar
Files: styles.css, index.html, app.js

Media query for < 768px: sidebar slides off-screen, hamburger button toggles it.

2e. Accessibility
Files: index.html, nav.js, modal.js, styles.css

Skip link: <a href="#content" class="skip-link">Skip to content</a>
ARIA: role="navigation" on sidebar, role="main" on content, role="dialog" aria-modal="true" on modals
Skip link CSS with focus reveal
2f. Table Scroll on Mobile
File: styles.css

Change .table-wrap from overflow: hidden to overflow-x: auto.

2g. Error States with Retry
Files: all page JS files

Add retry button to error messages.

Phase 3: Backend Improvements
3a. Stats — Budget Limits + Previous Month
File: /home/devuser/dev/projects/atlas-ai/backend/src/api/admin.routes.js (lines 142-175)

Add to /admin/stats response:


budgetLimits: {
  global: parseFloat(process.env.ATLAS_MONTHLY_LIMIT_USD) || 5.0,
  gemini: parseFloat(process.env.GEMINI_MONTHLY_LIMIT_USD) || 4.0,
  groq: parseFloat(process.env.GROQ_MONTHLY_LIMIT_USD) || 1.0
},
previousMonth: { totalUsd, geminiUsd, groqUsd, userCount }
Add previous month aggregation to the existing Promise.all.

3b. Health — Provider Status
File: Where /health is defined (main server file or routes)

Add to response: providers: { gemini: !!process.env.GEMINI_API_KEY, groq: !!process.env.GROQ_API_KEY }

Phase 4: Feature Enhancements
4a. Trend Indicators on Overview
Show up/down arrow on stat cards comparing current vs previous month spend.

4b. Provider Filter on Usage Page
Add provider dropdown to usage filters. Backend already supports provider query param.

4c. Gemini Badge Styling
Gemini: badge-warning (amber). Groq: badge-success (green). Distinct at a glance.

Files Summary
#	File	Key Changes
1	atlas-ai/frontend/css/styles.css	.openai→.gemini, Gemini color, spinner, responsive sidebar, skip link, table scroll
2	atlas-ai/frontend/index.html	ARIA roles, skip link, hamburger menu button
3	atlas-ai/frontend/js/app.js	Mobile menu toggle
4	atlas-ai/frontend/js/pages/overview.js	OpenAI→Gemini, budget warning, trend, spinner, provider health
5	atlas-ai/frontend/js/pages/usage.js	OpenAI→Gemini, provider filter, spinner, badge colors
6	atlas-ai/frontend/js/pages/clients.js	allowedProviders fix, spinner
7	atlas-ai/frontend/js/pages/keys.js	Spinner
8	atlas-ai/frontend/js/components/nav.js	ARIA
9	atlas-ai/frontend/js/components/modal.js	ARIA dialog
10	atlas-ai/frontend/js/components/table.js	Custom empty messages
11	atlas-ai/backend/src/api/admin.routes.js	Stats: budgetLimits + prevMonth. Health: providers
Verification
pm2 restart atlas-ai
Dashboard: zero "OpenAI" references, cost bars show "Gemini" (amber) + "Groq" (green)
Budget warning visible when spend > 80%
Loading spinners on all pages
Resize to < 768px: sidebar collapses, hamburger works
Tab through interface: visible focus indicators
Usage page: provider filter dropdown filters logs
Stat cards show trend arrows vs previous month
User approved the plan
Update Todos

Phase 1: Remove all OpenAI references (overview.js, usage.js, clients.js, styles.css)

Phase 2a: Add loading spinners to CSS and all page JS files

Phase 2b-c: Budget warnings + provider health on overview

Phase 2d: Responsive sidebar with hamburger menu

Phase 2e-f: Accessibility (ARIA, skip link) + table scroll

Phase 2g: Error states with retry buttons

Phase 3: Backend - stats budgetLimits + prevMonth, health providers

Phase 4: Trend indicators, provider filter, badge colors

Restart Atlas AI and verify all changes
# Changelog

All notable changes to Dev-Journal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **Entry Version History** - Added persistent `EntryVersion` snapshots with list, preview, and restore flows on the entry page.
- **Explorer Media Upload Flow** - Added media upload support for image/audio/video with explorer file creation and auto-embed markdown snippet insertion.
- **Entry Markdown Vendor Pipeline** - Entry view now ships with vendored markdown dependencies (`marked`, `marked-gfm-heading-id`, `dompurify`) for deterministic rendering.

### Changed
- **Entry Markdown Renderer** - `/entry/:id` now prefers Marked + GFM heading IDs with a guarded fallback mode and runtime diagnostics.
- **Entry Preview UX** - Entry page uses Preview/Raw mode shell with same-page hash navigation behavior for TOC links.
- **Entry Sidebar UX** - Details/Tags/Version panels now use accordion behavior and mobile drawer interaction.
- **Copy UX Feedback** - Copy actions now include toast feedback in addition to inline button state updates.

### Fixed
- **TOC Anchor Navigation** - Internal markdown hash links now resolve and scroll in-page instead of opening a new tab.
- **Markdown Rendering Consistency** - Task-lists and table rendering now follow GFM output with mobile-safe table overflow handling.
- **Copy Action Reliability** - Code copy paths now use robust clipboard fallback handling with consistent success/failure feedback states.

---

## [1.6.0] - 2026-02-09

### Changed
- **Explain Page Dark Theme** - Complete overhaul matching Dev-Journal dark UI (CSS variables)
- **Explain Page Username** - Fixed display from `user.username` to `user.name || user.email || 'User'`
- **Explain Page Code Blocks** - Now use existing CSS classes (`code-header`, `code-lang`, `copy-btn`)
- **Explain Page Errors** - Error states use dark theme colors (`var(--danger)`, `var(--card)`)

### Fixed
- **Explain 500 Error** - Truncated entry content to 8,000 chars (was exceeding Atlas AI 10k prompt limit)
- **Summarize Overflow** - Truncated per-file content to 400 chars for folder summarization

---

## [1.5.0] - 2026-02-09

### Added
- **Explain Page** - Dedicated `/entry/:id/explain` page with conversational AI chat interface
- **Cascade Deletion** - Mongoose pre-delete hooks on User model (deleting user removes all Entries + Coupons)

---

## [1.4.0] - 2026-02-08

### Added
- **Atlas AI Integration** - Summarize, Explain, Ask AI actions via Atlas AI microservice
- **Settings Page** - Dedicated `/settings` page with Profile, AI Access, and Security sub-tabs
- **Coupon System** - Users can redeem coupon codes to activate AI access
- **Admin Coupon Management** - Create, list, and disable coupons from admin panel
- **Admin AI Toggle** - Enable/disable AI access per user from admin panel
- **Admin Delete Cascade** - Deleting users from admin panel cleans up entries + coupons
- **Default Admin Seed** - `seedAdmin.js` script for initial admin user creation

---

## [1.3.0] - 2026-02-04

### Added
- **JWT Authentication** - Secure login/register system
  - User registration with email/password
  - Login with 7-day JWT token expiration
  - Password hashing with bcryptjs (cost factor 12)
  - User model with email validation
- **Protected API Routes** - All entry endpoints require authentication
- **User Isolation** - Each user sees only their own entries
- **Login Page** - Email/password form with error handling
- **Register Page** - Registration with password confirmation
- **Auth Utilities** - Client-side auth module (token storage, auth checks, redirects)
- **Logout Functionality** - Logout button in navigation

### Changed
- Entry model now includes userId field (required, indexed)
- All API queries scoped by authenticated user
- Frontend redirects to login if not authenticated

### Security
- Passwords never stored in plain text
- JWT tokens verified on every protected request
- User cannot access other users' entries

### Removed
- **Old Entries Cleanup** - Deleted 5 pre-authentication entries from database

---

## [1.2.0] - 2026-02-04

### Added
- **Prism.js Syntax Highlighting** - Professional code syntax highlighting for 10+ languages (JavaScript, TypeScript, Python, Bash, JSON, CSS, HTML, SQL, Go, Rust)
- Custom token colors matching the dark theme palette

### Changed
- Updated CSS to support Prism.js token styling
- Removed hardcoded code block colors in favor of Prism theme

---

## [1.1.0] - 2026-02-04

### Added
- **File Explorer UI** - Tree-view sidebar for navigating entries by category
- **Breadcrumb Navigation** - Home > Category > Entry path display
- **Grid/List View Toggle** - Switch between card grid and list view
- **Auto-detect Code Blocks** - Automatic detection of markdown code blocks (```language) and inline code (`code`)
- **Copy Code Button** - One-click copy for all code blocks with visual feedback

### Changed
- Sidebar redesigned with file tree structure
- Entry cards now show file-style icons based on category
- Category counts displayed in sidebar

---

## [1.0.0] - 2026-02-03

### Added
- **Initial Release** - Dev-Journal web application
- **CRUD Operations** - Create, Read, Update, Delete journal entries
- **Categories** - Daily Learning, Project Notes, Bug Fixes, Code Snippets, Concepts
- **Tags** - Tag-based organization for entries
- **Search** - Full-text search across all entries
- **Code Block Support** - Dedicated code block field with language selection
- **Mobile Responsive Design** - Hamburger menu, 5 responsive breakpoints
- **Dark Theme** - Professional dark UI with CSS variables
- **Production Deployment** - Live at https://stackpilot.in
  - Node.js + Express backend
  - MongoDB Atlas database
  - PM2 process manager with auto-restart
  - Nginx reverse proxy
  - Let's Encrypt SSL certificate

---

## Upcoming Features

- [x] Statistics dashboard with activity charts
- [x] AI-powered Summarize, Explain, Ask AI
- [x] Settings page with coupon redemption
- [x] Admin panel with RBAC
- [x] Markdown live preview while editing
- [ ] Export entries to Markdown/PDF
- [ ] Keyboard shortcuts for quick actions
- [ ] Entry templates for different categories
- [x] Version history for entries
- [ ] GitHub Gist backup integration
- [ ] Dark/Light mode toggle
- [ ] Password reset functionality
- [ ] Remember me option for login
- [ ] Atlas Agent integration (context-aware AI conversations)

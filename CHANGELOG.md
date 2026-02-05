# Changelog

All notable changes to Dev-Journal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

- [ ] Markdown live preview while editing
- [ ] Export entries to Markdown/PDF
- [ ] Keyboard shortcuts for quick actions
- [ ] Entry templates for different categories
- [ ] Version history for entries
- [ ] GitHub Gist backup integration
- [ ] Dark/Light mode toggle
- [ ] Statistics dashboard with activity heatmap
- [ ] Password reset functionality
- [ ] Remember me option for login

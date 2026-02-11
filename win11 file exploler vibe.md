You are a senior product engineer and UI systems architect.

Your task is to DESIGN and IMPLEMENT a Windows 11–style “Desktop Home Page”
for my Dev Journal web app.

This is NOT just UI.
You must design BOTH frontend behavior and backend logic together.

━━━━━━━━━━━━━━━━━━━━━━
1️⃣ PRODUCT GOAL
━━━━━━━━━━━━━━━━━━━━━━

Build a Dev Journal HOME page that behaves like the Windows 11 desktop.

Concept:
- The Home page = Desktop
- Folders = Categories / Collections
- Files = Markdown journal entries
- Pinning a folder = Adding it to Desktop
- Removing a folder = Removing from Desktop (not deleting data)

The UX should feel like:
Windows 11 Desktop + File Explorer

━━━━━━━━━━━━━━━━━━━━━━
2️⃣ CORE UX BEHAVIOR (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━

Desktop (Home Page):
- Grid-based layout (icons with labels)
- Folder icons displayed like Windows 11
- Supports:
  - Single click → select
  - Double click → open folder
  - Right click → context menu
  - Keyboard navigation (Enter, Delete, Arrow keys)
- Empty desktop state shown cleanly

Folder Behavior:
- Any folder created in Dev Journal can be:
  - Pinned to Desktop
  - Unpinned from Desktop
- Desktop only shows pinned folders
- Opening a folder navigates into File Explorer view

Visual Rules:
- Windows 11 dark theme
- Rounded corners
- Subtle shadows
- Smooth hover & focus states
- Accessible contrast (WCAG)

━━━━━━━━━━━━━━━━━━━━━━
3️⃣ BACKEND LOGIC (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━

Design backend data flow using MongoDB.

Required concepts:
- Folder entity
- Entry (file) entity
- Desktop state (pinned folders)

Example logic (conceptual):
- Folder schema includes:
  - name
  - type = "folder"
  - ownerId
  - isPinned (boolean)
  - createdAt
- Desktop is NOT a real folder
- Desktop = query of folders where isPinned = true

Required APIs:
- GET  /api/desktop
  → returns all pinned folders for logged-in user

- POST /api/folders
  → create folder

- PATCH /api/folders/:id/pin
  → pin / unpin folder from desktop

- DELETE /api/folders/:id
  → delete folder (remove everywhere)

Security:
- JWT protected
- User isolation (ownerId enforced)
- No cross-user visibility

━━━━━━━━━━━━━━━━━━━━━━
4️⃣ FRONTEND IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━

Home Page Responsibilities:
- Fetch desktop folders from backend
- Render grid layout dynamically
- Show loading skeletons
- Handle empty state
- Cache UI state safely
- Re-render after pin/unpin without refresh

Context Menu (Right Click):
- Open
- Rename
- Pin / Unpin from Desktop
- Delete (with confirmation)

Navigation:
- Desktop → Folder → File
- Breadcrumb updates correctly
- Back button works logically

━━━━━━━━━━━━━━━━━━━━━━
5️⃣ STATE MANAGEMENT RULES
━━━━━━━━━━━━━━━━━━━━━━

- Desktop state is backend-driven (not frontend-only)
- Refreshing page MUST preserve desktop layout
- No hardcoded folders
- Everything comes from API

━━━━━━━━━━━━━━━━━━━━━━
6️⃣ EDGE CASES TO HANDLE
━━━━━━━━━━━━━━━━━━━━━━

- User has no folders
- User unpins last folder
- Folder deleted while open
- Network failure
- Token expired
- Rapid pin/unpin actions

━━━━━━━━━━━━━━━━━━━━━━
7️⃣ OUTPUT FORMAT REQUIRED
━━━━━━━━━━━━━━━━━━━━━━

You must provide:

1. High-level architecture explanation
2. Backend schema & API design
3. Frontend UI structure (HTML layout)
4. Frontend JS logic flow
5. UX rules matching Windows 11 behavior
6. Accessibility considerations
7. Clear separation of concerns

━━━━━━━━━━━━━━━━━━━━━━
8️⃣ CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━

- No frameworks (React/Vue/etc)
- Use vanilla JS + HTML + CSS
- No overengineering
- This is a production feature
- Must feel like a real OS desktop

━━━━━━━━━━━━━━━━━━━━━━
FINAL GOAL
━━━━━━━━━━━━━━━━━━━━━━

After implementation:
- Dev Journal Home feels like Windows 11 Desktop
- Any folder can appear on Desktop
- Desktop survives refresh
- UX feels native, clean, and intentional

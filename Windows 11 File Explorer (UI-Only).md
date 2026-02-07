You are a senior frontend engineer who has worked on
desktop-like interfaces and system panels.

I am building a web-based File Explorer UI that should feel
as close as possible to Windows 11 File Explorer.

IMPORTANT:
- This is NOT a normal website UI
- This is a desktop-like system panel
- Focus on interaction behavior, not visual decoration
- Assume backend APIs already exist
- This task is UI + UX logic ONLY

TECH CONSTRAINTS:
- HTML + CSS + vanilla JavaScript only
- No React, Vue, Angular
- No CSS frameworks
- No backend code
- No beginner explanations

GOAL:
Replicate Windows 11 File Explorer *behavior* inside the browser.

UI FEATURES:
- Folder and file grid / list view
- Sidebar (Quick Access–style)
- Breadcrumb navigation
- Selection highlighting
- Context menu (right-click)
- Keyboard navigation
- Smooth but subtle transitions

CRITICAL INTERACTION RULES:
- Single click → select item (highlight only)
- Double click → open file or folder
- Clicking empty space → clear selection
- Right click on item → item-specific context menu
- Right click on empty area → general context menu
- Only one item selected at a time (for now)

KEYBOARD BEHAVIOR:
- ↑ / ↓ : move selection
- Enter : open selected item
- Backspace : go to parent folder
- Ctrl + N : create new file
- Ctrl + Shift + N : create new folder
- Delete : delete selected item
- Esc : clear selection / close context menu

STATE MANAGEMENT (FRONTEND ONLY):
Maintain a single in-memory state object like:

{
  currentFolderId,
  selectedItemId,
  viewMode,          // grid | list
  isContextMenuOpen,
  breadcrumbPath
}

TASKS FOR YOU:
1. Design the UI architecture (components & responsibilities)
2. Explain the correct event flow for mouse interactions
3. Explain how to differentiate single-click vs double-click cleanly
4. Describe keyboard navigation logic in detail
5. Propose DOM structure conventions (classes / data-* attributes)
6. List common mistakes that break the “Explorer feel”
7. Suggest best practices for performance and responsiveness

AVOID:
- Tutorials
- Backend assumptions
- Over-animations
- Generic dashboard patterns
- Marketing language

Respond like a senior UI engineer designing a system-level interface,
not a typical web app.

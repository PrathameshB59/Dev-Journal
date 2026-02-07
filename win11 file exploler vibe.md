You are a senior software architect and full-stack engineer.

I am building a production-grade Dev Journal application that mimics the
Windows 11 File Explorer experience, but uses a virtual filesystem backed
by MongoDB Atlas (not a real OS filesystem).

Here is the architecture and design I have finalized:

GOAL
- Windows-11-like File Explorer UI
- Virtual filesystem stored in MongoDB
- OS-level interactions (single click select, double click open, context menu, keyboard navigation)
- Scalable, secure, production-ready system

CORE PRINCIPLE
- The File Explorer is NOT the data
- It is a VIEW over the data

LAYERS
1. UI Layer (Explorer Shell: HTML + CSS)
2. State Layer (Explorer Brain: fileExplorer.js)
3. Data Layer (Virtual Filesystem: MongoDB)

HIGH-LEVEL FLOW
Browser (User)
↓
Explorer UI (HTML + CSS)
↓
Explorer State Manager (fileExplorer.js)
↓
Explorer API (Express.js)
↓
MongoDB Atlas (Virtual File System)

VIRTUAL FILESYSTEM SCHEMA (MongoDB)
- Files and folders are the SAME entity
- Only the "type" field differs

Entry schema:
{
  _id: ObjectId,
  name: "firewall.md",
  type: "file" | "folder",
  parentId: ObjectId | null,
  content: String,        // files only
  mime: "text/markdown",
  ownerId: ObjectId,
  pinned: Boolean,
  favorite: Boolean,
  tags: ["vps", "security"],
  createdAt,
  updatedAt
}

ROOT STRUCTURE (PER USER)
ROOT
 ├── Daily Learning
 ├── Project Notes
 │    └── Dev Journal
 ├── Bug Fixes
 ├── Code Snippets
 └── Concepts

EXPLORER-SPECIFIC APIs (NOT GENERIC CRUD)
GET    /api/explorer/root
GET    /api/explorer/folder/:id
POST   /api/explorer/file
POST   /api/explorer/folder
PATCH  /api/explorer/:id
DELETE /api/explorer/:id
GET    /api/explorer/breadcrumb/:id

STATE MANAGER (fileExplorer.js)
const ExplorerState = {
  currentFolderId: null,
  selectedEntryId: null,
  viewMode: "grid", // grid | list
  sortBy: "name",
  history: []
};

INTERACTION RULES
- Single click → select
- Double click → open
- Right click → context menu
- Keyboard:
  ↑ ↓ navigate
  Enter open
  Backspace go up
  Ctrl+N new file
  Ctrl+Shift+N new folder
  Delete delete

SECURITY
- JWT authentication
- ownerId isolation on every query
- RBAC
- Rate limiting
- Input sanitization

PERFORMANCE
Indexes:
- { parentId, ownerId }
- { name }
- { tags }

MENTAL MODEL
- MongoDB = Disk
- Express = Kernel
- fileExplorer.js = explorer.exe
- Dev Journal = Virtual OS panel

TASK FOR YOU:
1. Review this architecture critically like a production system.
2. Point out any weaknesses, missing pieces, or edge cases.
3. Suggest improvements ONLY if they are production-grade.
4. Propose a clean implementation plan (step-by-step).
5. Avoid beginner explanations, tutorials, or UI fluff.
6. Think like this will be used daily by a real developer.

Respond like a senior engineer doing a design review.
Keep the response structured, concise, and opinionated.

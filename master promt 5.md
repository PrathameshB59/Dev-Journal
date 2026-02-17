You are a senior full-stack engineer building a Windows 11–style
File Explorer web application.

Project: Dev Journal

Current state:

- Folder creation works
- Entries exist
- Sidebar categories exist
- UI looks like Windows 11
  BUT core file-management logic is incomplete.

  Your task is to UPGRADE the system architecture
  to behave like a real file explorer.

  This is NOT cosmetic.
  This is structural.

  ━━━━━━━━━━━━━━━━━━━━━━
  1️⃣ DRAG & DROP / MOVE FILES BETWEEN FOLDERS
  ━━━━━━━━━━━━━━━━━━━━━━

  Current issue:

  - Files cannot be moved into folders
  - No drag-and-drop support
  - No right-click → Move option

  You must implement:

  A) Folder–Entry relationship in backend

  - Entry must store:
    - categoryId (folder reference)
      - parentFolderId (optional for nesting later)

      B) API:

      - PATCH /api/entries/:id/move
        body: { categoryId }

        C) Frontend:

        - Enable drag-and-drop:
          - Draggable entry items
            - Droppable folder targets
              - Highlight drop target
                - On drop → call move API
                - Add right-click context menu:
                  - Move to…
                    - Rename
                      - Delete

                      Must behave like Windows Explorer:

                      - Visual feedback while dragging
                      - No page refresh
                      - Safe state update

                      ━━━━━━━━━━━━━━━━━━━━━━
                      2️⃣ CATEGORY CREATION FORM
                      ━━━━━━━━━━━━━━━━━━━━━━

                      Currently:

                      - No dedicated category creation UI

                      You must design:

                      category-form.html

                      Fields:

                      - Category Name (required)
                      - Optional Description
                      - Optional Icon Image upload
                      - Color (optional accent color)
                      - "Pin to Desktop" checkbox

                      Backend:
                      POST /api/categories
                      Fields:

                      - name
                      - description
                      - iconPath
                      - isPinned
                      - ownerId

                      Validation:

                      - No duplicate names per user
                      - Trim input
                      - Sanitize text

                      ━━━━━━━━━━━━━━━━━━━━━━
                      3️⃣ ENTRY FORM → SELECT FOLDER
                      ━━━━━━━━━━━━━━━━━━━━━━

                      In new-entry.html:

                      Add:

                      - Dropdown of categories
                      - Default selection = "Uncategorized"
                      - Allow user to move entry later
                      - Auto-update folder view after save

                      Backend:
                      Ensure entry saves with categoryId.

                      ━━━━━━━━━━━━━━━━━━━━━━
                      4️⃣ CUSTOM ICON FOR FOLDER
                      ━━━━━━━━━━━━━━━━━━━━━━

                      Upgrade folder creation form to include:

                      - Icon image upload
                      - Store file path in DB
                      - Fallback to default folder icon if none

                      Folder schema:
                      {
                      name: String,
                      icon: String,
                      description: String,
                      isPinned: Boolean,
                      ownerId: ObjectId
                      }

                      Frontend:

                      - Render custom icon if exists
                      - Otherwise use default folder SVG

                      Must not break layout if image missing.

                      ━━━━━━━━━━━━━━━━━━━━━━
                      5️⃣ ADDITIONAL FEATURES (FROM SCREENSHOT)
                      ━━━━━━━━━━━━━━━━━━━━━━

                      Implement:

                      A) Markdown live preview while editing

                      - Split view
                      - Toggle preview
                      - Lightweight renderer

                      B) Export entries

                      - Export as Markdown (.md)
                      - Export as PDF
                      - Backend route:
                        GET /api/entries/:id/export?type=md|pdf

                        C) Entry templates

                        - Predefined templates per category
                        - Optional starter content

                        D) Version history

                        - Save previous versions
                        - Store in EntryVersions collection
                        - Show "View History" button
                        - Restore previous version

                        ━━━━━━━━━━━━━━━━━━━━━━
                        6️⃣ SECURITY & STRUCTURE
                        ━━━━━━━━━━━━━━━━━━━━━━

                        - All actions must check ownerId
                        - No cross-user data access
                        - All move operations must validate:
                          - Folder belongs to user
                          - Prevent orphaned entries

                          ━━━━━━━━━━━━━━━━━━━━━━
                          7️⃣ UI REQUIREMENTS
                          ━━━━━━━━━━━━━━━━━━━━━━

                          Maintain:

                          - Windows 11 dark aesthetic
                          - Responsive layout
                          - Accessible drag-and-drop
                          - Keyboard support (Move via keyboard)

                          ━━━━━━━━━━━━━━━━━━━━━━
                          8️⃣ OUTPUT FORMAT
                          ━━━━━━━━━━━━━━━━━━━━━━

                          Provide:

                          1. Updated database schemas
                          2. Required backend routes
                          3. Frontend drag-and-drop logic explanation
                          4. category-form.html structure
                          5. new-entry.html updated structure
                          6. Folder icon upload flow
                          7. Version history architecture
                          8. Implementation order (step-by-step)

                          Do NOT:

                          - Suggest frameworks
                          - Redesign whole app
                          - Overcomplicate nesting (keep 1 level for now)

                          Goal:
                          Dev Journal should behave like a REAL file explorer,
                          not just a styled
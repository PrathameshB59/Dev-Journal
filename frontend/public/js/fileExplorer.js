// Advanced File Explorer Module for Dev-Journal
const FileExplorer = {
    // State
    currentView: 'grid',
    selectedItems: [],
    focusedItem: null,
    sortBy: 'date',
    sortOrder: 'desc',
    contextMenuOpen: false,

    // Initialize file explorer
    init() {
        this.setupKeyboardNav();
        this.setupContextMenu();
        this.setupDragDrop();
    },

    // Setup keyboard navigation
    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Don't capture when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const fileList = document.getElementById('fileList');
            if (!fileList) return;

            const items = Array.from(fileList.querySelectorAll('.file-item'));
            if (!items.length) return;

            const currentIndex = items.findIndex(item => item === this.focusedItem);

            switch (e.key) {
                case 'ArrowDown':
                case 'j':
                    e.preventDefault();
                    this.focusItem(items, currentIndex + 1);
                    break;
                case 'ArrowUp':
                case 'k':
                    e.preventDefault();
                    this.focusItem(items, currentIndex - 1);
                    break;
                case 'Enter':
                    if (this.focusedItem) {
                        e.preventDefault();
                        const entryType = this.focusedItem.dataset.type;
                        const entryId = this.focusedItem.dataset.entryId;
                        if (entryType === 'folder') {
                            // Navigate into folder
                            if (window.Win11) Win11.navigateToFolder(entryId);
                        } else {
                            // Open file
                            window.location.href = `/entry/${entryId}`;
                        }
                    }
                    break;
                case 'Backspace':
                    if (!e.ctrlKey) {
                        e.preventDefault();
                        // Go up to parent folder
                        if (window.Win11 && window.Win11State && window.Win11State.currentFolderId) {
                            const folder = Win11State.folderMap[Win11State.currentFolderId];
                            if (folder && folder.parentId) {
                                Win11.navigateToFolder(folder.parentId);
                            } else {
                                Win11.navigateToRoot();
                            }
                        }
                    }
                    break;
                case 'Delete':
                    if (this.focusedItem) {
                        e.preventDefault();
                        const entryId = this.focusedItem.dataset.entryId;
                        const entryType = this.focusedItem.dataset.type;
                        const msg = entryType === 'folder'
                            ? 'Delete this folder and all its contents?'
                            : 'Delete this entry?';
                        if (entryId && confirm(msg)) {
                            this.deleteEntry(entryId);
                        }
                    }
                    break;
                case 'F2':
                    if (this.focusedItem) {
                        e.preventDefault();
                        const entryId = this.focusedItem.dataset.entryId;
                        this.renameEntry(entryId);
                    }
                    break;
                case 'n':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        if (window.Win11) Win11.promptCreateFolder();
                    } else if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = '/new';
                    }
                    break;
                case 'Escape':
                    this.closeContextMenu();
                    this.clearSelection();
                    break;
            }
        });
    },

    // Focus an item by index
    focusItem(items, index) {
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;

        if (this.focusedItem) {
            this.focusedItem.classList.remove('focused');
        }

        this.focusedItem = items[index];
        if (this.focusedItem) {
            this.focusedItem.classList.add('focused');
            this.focusedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            this.focusedItem.focus();
        }
    },

    // Clear selection
    clearSelection() {
        this.selectedItems.forEach(item => item.classList.remove('selected'));
        this.selectedItems = [];
        if (this.focusedItem) {
            this.focusedItem.classList.remove('focused');
            this.focusedItem = null;
        }
    },

    // Setup context menu (right-click)
    setupContextMenu() {
        // Create context menu element
        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.className = 'context-menu';
        menu.innerHTML = `
            <ul role="menu">
                <li role="menuitem" tabindex="-1" data-action="open"><span>&#128194;</span> Open</li>
                <li role="menuitem" tabindex="-1" data-action="edit"><span>&#9998;</span> Edit</li>
                <li role="menuitem" tabindex="-1" data-action="rename"><span>&#128221;</span> Rename</li>
                <li role="menuitem" tabindex="-1" data-action="favorite"><span>&#9733;</span> Toggle Favorite</li>
                <li role="menuitem" tabindex="-1" data-action="pin"><span>&#128204;</span> Toggle Pin</li>
                <li role="menuitem" tabindex="-1" data-action="move-to"><span>&#128230;</span> Move to...</li>
                <li class="divider"></li>
                <li role="menuitem" tabindex="-1" data-action="ai-summarize" class="ai-action"><span>&#129302;</span> Summarize</li>
                <li role="menuitem" tabindex="-1" data-action="ai-explain" class="ai-action"><span>&#129302;</span> Explain</li>
                <li class="divider"></li>
                <li role="menuitem" tabindex="-1" data-action="delete" class="danger"><span>&#128465;</span> Delete</li>
            </ul>
        `;
        document.body.appendChild(menu);

        // Handle right-click on entries
        document.addEventListener('contextmenu', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, fileItem);
            }
        });

        // Handle context menu actions
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action || !this.contextMenuTarget) return;

            const entryId = this.contextMenuTarget.dataset.entryId;
            const entryType = this.contextMenuTarget.dataset.type;

            switch (action) {
                case 'open':
                    if (entryType === 'folder') {
                        if (window.Win11) Win11.navigateToFolder(entryId);
                    } else {
                        window.location.href = `/entry/${entryId}`;
                    }
                    break;
                case 'edit':
                    if (entryType === 'file') {
                        window.location.href = `/edit/${entryId}`;
                    }
                    break;
                case 'rename':
                    this.renameEntry(entryId);
                    break;
                case 'favorite':
                    this.toggleFavorite(entryId);
                    break;
                case 'pin':
                    this.togglePin(entryId);
                    break;
                case 'move-to':
                    this.showMoveToModal(entryId);
                    break;
                case 'ai-summarize':
                    if (entryType === 'folder' && window.AiPanel) {
                        AiPanel.summarizeFolder(entryId);
                    }
                    break;
                case 'ai-explain':
                    if (entryType === 'file' && window.AiPanel) {
                        AiPanel.explainEntry(entryId);
                    }
                    break;
                case 'delete': {
                    const msg = entryType === 'folder'
                        ? 'Delete this folder and all its contents?'
                        : 'Are you sure you want to delete this entry?';
                    if (confirm(msg)) {
                        this.deleteEntry(entryId);
                    }
                    break;
                }
            }

            this.closeContextMenu();
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.closeContextMenu();
            }
        });

        // Keyboard navigation for context menu
        menu.addEventListener('keydown', (e) => {
            const items = [...menu.querySelectorAll('[role="menuitem"]')].filter(el => el.style.display !== 'none');
            const idx = items.indexOf(document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    items[(idx + 1) % items.length].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    items[(idx - 1 + items.length) % items.length].focus();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (document.activeElement.dataset.action) document.activeElement.click();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeContextMenu();
                    break;
            }
        });
    },

    // Show context menu
    showContextMenu(x, y, target) {
        const menu = document.getElementById('contextMenu');
        if (!menu) return;

        this.contextMenuTarget = target;
        this.contextMenuOpen = true;

        const entryType = target.dataset.type;

        // Hide edit option for folders
        const editItem = menu.querySelector('[data-action="edit"]');
        if (editItem) editItem.style.display = entryType === 'folder' ? 'none' : '';

        // Show "Summarize" for folders, "Explain" for files
        const summarizeItem = menu.querySelector('[data-action="ai-summarize"]');
        const explainItem = menu.querySelector('[data-action="ai-explain"]');
        if (summarizeItem) summarizeItem.style.display = entryType === 'folder' ? '' : 'none';
        if (explainItem) explainItem.style.display = entryType === 'file' ? '' : 'none';

        // Position menu
        menu.style.display = 'block';

        const menuRect = menu.getBoundingClientRect();
        if (x + menuRect.width > window.innerWidth) {
            x = window.innerWidth - menuRect.width - 10;
        }
        if (y + menuRect.height > window.innerHeight) {
            y = window.innerHeight - menuRect.height - 10;
        }

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        // Focus first visible menu item for keyboard access
        const firstItem = menu.querySelector('[role="menuitem"]:not([style*="display: none"])');
        if (firstItem) firstItem.focus();
    },

    // Close context menu
    closeContextMenu() {
        const menu = document.getElementById('contextMenu');
        if (menu) {
            menu.style.display = 'none';
        }
        this.contextMenuTarget = null;
        this.contextMenuOpen = false;
    },

    // Setup drag and drop for moving entries between folders
    setupDragDrop() {
        document.addEventListener('dragstart', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                e.dataTransfer.setData('text/plain', fileItem.dataset.entryId);
                e.dataTransfer.effectAllowed = 'move';
                fileItem.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                fileItem.classList.remove('dragging');
            }
            // Remove all drag-over highlights
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        // Allow dropping on folder items
        document.addEventListener('dragover', (e) => {
            const folderItem = e.target.closest('.folder-item');
            if (folderItem) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                folderItem.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const folderItem = e.target.closest('.folder-item');
            if (folderItem) {
                folderItem.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', async (e) => {
            const folderItem = e.target.closest('.folder-item');
            if (folderItem) {
                e.preventDefault();
                folderItem.classList.remove('drag-over');

                const entryId = e.dataTransfer.getData('text/plain');
                const targetFolderId = folderItem.dataset.entryId;

                if (entryId && targetFolderId && entryId !== targetFolderId) {
                    await this.moveEntry(entryId, targetFolderId);
                }
            }
        });

        // Also allow dropping on pinned folders
        document.addEventListener('dragover', (e) => {
            const pinnedFolder = e.target.closest('.pinned-folder');
            if (pinnedFolder) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                pinnedFolder.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const pinnedFolder = e.target.closest('.pinned-folder');
            if (pinnedFolder) {
                pinnedFolder.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', async (e) => {
            const pinnedFolder = e.target.closest('.pinned-folder');
            if (pinnedFolder) {
                e.preventDefault();
                pinnedFolder.classList.remove('drag-over');

                const entryId = e.dataTransfer.getData('text/plain');
                const targetFolderId = pinnedFolder.dataset.folderId;

                if (entryId && targetFolderId) {
                    await this.moveEntry(entryId, targetFolderId);
                }
            }
        });
    },

    // Rename entry
    async renameEntry(entryId) {
        const newName = prompt('Enter new name:');
        if (!newName || !newName.trim()) return;

        try {
            const result = await window.ExplorerAPI.updateEntry(entryId, { name: newName.trim() });
            if (result.success) {
                if (window.Win11) {
                    await Win11.loadCurrentView();
                    // Focus the renamed item
                    const renamed = document.querySelector(`[data-entry-id="${entryId}"]`);
                    if (renamed) renamed.focus();
                }
                this.showToast('Renamed successfully');
            } else {
                this.showToast('Failed to rename: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            this.showToast('Failed to rename: ' + error.message, 'error');
        }
    },

    // Toggle favorite
    async toggleFavorite(entryId) {
        try {
            // Get current state from DOM
            const item = document.querySelector(`.file-item[data-entry-id="${entryId}"]`);
            const isFav = item && item.querySelector('.fav-indicator');

            const result = await window.ExplorerAPI.updateEntry(entryId, { favorite: !isFav });
            if (result.success) {
                if (window.Win11) Win11.loadCurrentView();
                this.showToast(isFav ? 'Removed from favorites' : 'Added to favorites');
            }
        } catch (error) {
            this.showToast('Failed to update favorite', 'error');
        }
    },

    // Toggle pin
    async togglePin(entryId) {
        try {
            const item = document.querySelector(`.file-item[data-entry-id="${entryId}"]`);
            const isPinned = item && item.querySelector('.pinned-indicator');

            const result = await window.ExplorerAPI.updateEntry(entryId, { pinned: !isPinned });
            if (result.success) {
                if (window.Win11) Win11.loadCurrentView();
                this.showToast(isPinned ? 'Unpinned' : 'Pinned');
            }
        } catch (error) {
            this.showToast('Failed to update pin', 'error');
        }
    },

    // Move entry to a folder
    async moveEntry(entryId, targetFolderId) {
        try {
            const result = await window.ExplorerAPI.moveEntry(entryId, targetFolderId);
            if (result.success) {
                if (window.Win11) Win11.loadCurrentView();
                this.showToast('Moved successfully');
            } else {
                this.showToast('Failed to move: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            this.showToast('Failed to move: ' + error.message, 'error');
        }
    },

    // Delete entry via explorer API
    async deleteEntry(entryId) {
        try {
            const result = await window.ExplorerAPI.deleteEntry(entryId);

            if (result.success) {
                // Remove from DOM
                const card = document.querySelector(`[data-entry-id="${entryId}"]`);
                const nextSibling = card?.nextElementSibling || card?.previousElementSibling;
                if (card) card.remove();
                // Move focus to next item or file list
                if (nextSibling) { nextSibling.focus(); } else {
                    const fileList = document.getElementById('fileList');
                    if (fileList) fileList.focus();
                }
                this.showToast('Deleted');
            } else {
                this.showToast('Failed to delete', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Failed to delete', 'error');
        }
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Show "Move to..." modal with folder picker
    async showMoveToModal(entryId) {
        let modal = document.getElementById('moveToModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'moveToModal';
            modal.className = 'folder-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.innerHTML = `
                <div class="folder-modal">
                    <div class="folder-modal-header">
                        <h3>&#128230; Move to...</h3>
                        <button class="folder-modal-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="folder-modal-body">
                        <div class="move-folder-list" id="moveFolderList"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.folder-modal-close').addEventListener('click', () => { modal.style.display = 'none'; });
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
            modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.style.display = 'none'; });
        }

        const listEl = modal.querySelector('#moveFolderList');
        listEl.innerHTML = '<p style="padding:var(--space-md); color:var(--text-muted);">Loading folders...</p>';
        modal.style.display = 'flex';

        try {
            const result = await window.ExplorerAPI.getRoot();
            if (!result.success) return;

            const folders = result.data.filter(e => e.type === 'folder' && e._id !== entryId);
            let html = `<button class="move-folder-item" data-folder-id="">
                <span>&#127968;</span> Root (Home)
            </button>`;
            folders.forEach(f => {
                html += `<button class="move-folder-item" data-folder-id="${f._id}">
                    <span>&#128193;</span> ${this.escapeHtml(f.name)}
                </button>`;
            });
            listEl.innerHTML = html;

            listEl.querySelectorAll('.move-folder-item').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const targetId = btn.dataset.folderId || null;
                    modal.style.display = 'none';
                    await this.moveEntry(entryId, targetId);
                });
            });
        } catch (error) {
            listEl.innerHTML = '<p style="padding:var(--space-md); color:var(--danger);">Error loading folders</p>';
        }
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Add file explorer CSS dynamically
const fileExplorerStyles = document.createElement('style');
fileExplorerStyles.textContent = `
    /* Context Menu */
    .context-menu {
        display: none;
        position: fixed;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        min-width: 180px;
        padding: var(--space-xs) 0;
    }

    .context-menu ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .context-menu li {
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        transition: background var(--transition-fast);
    }

    .context-menu li:hover {
        background: var(--bg-secondary);
    }

    .context-menu li.danger:hover {
        background: rgba(239, 68, 68, 0.2);
        color: var(--danger);
    }

    .context-menu .divider {
        height: 1px;
        background: var(--border);
        margin: var(--space-xs) 0;
        padding: 0;
    }

    /* File Item States */
    .file-item.focused {
        outline: 2px solid var(--primary);
        outline-offset: -2px;
    }

    .file-item.selected {
        background: rgba(59, 130, 246, 0.1);
    }

    .file-item.dragging {
        opacity: 0.5;
    }

    .file-item.drag-over,
    .pinned-folder.drag-over {
        outline: 2px dashed var(--primary);
        outline-offset: -2px;
        background: rgba(59, 130, 246, 0.05);
    }

    /* Folder-specific styles */
    .folder-item {
        cursor: default;
    }

    .folder-item .file-icon.folder {
        font-size: 1.1em;
    }

    .folder-badge {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary);
    }

    /* Pinned/Favorite indicators */
    .pinned-indicator,
    .fav-indicator {
        font-size: 0.75em;
        margin-left: 4px;
    }

    .fav-indicator {
        color: #f59e0b;
    }

    /* Toast Notifications */
    .toast {
        position: fixed;
        bottom: var(--space-lg);
        right: var(--space-lg);
        padding: var(--space-md) var(--space-lg);
        background: var(--card-bg);
        border: 1px solid var(--success);
        border-radius: var(--radius-md);
        color: var(--text);
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    }

    .toast.error {
        border-color: var(--danger);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Folder Creation & Move-To Modal */
    .folder-modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 2000;
        justify-content: center;
        align-items: center;
    }
    .folder-modal {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        width: 90%;
        max-width: 440px;
        max-height: 80vh;
        overflow-y: auto;
        animation: modalIn 0.2s ease;
    }
    @keyframes modalIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .folder-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-md) var(--space-lg);
        border-bottom: 1px solid var(--border);
    }
    .folder-modal-header h3 { margin: 0; font-size: var(--text-lg); }
    .folder-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-muted);
        padding: 0 var(--space-xs);
    }
    .folder-modal-close:hover { color: var(--text); }
    .folder-modal-body {
        padding: var(--space-lg);
    }
    .folder-modal-body .form-group { margin-bottom: var(--space-md); }
    .folder-modal-body label { display: block; font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-xs); }
    .folder-modal-body input[type="text"],
    .folder-modal-body textarea {
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text);
        font-size: var(--text-base);
        box-sizing: border-box;
    }
    .folder-modal-body input:focus,
    .folder-modal-body textarea:focus {
        outline: none;
        border-color: var(--primary);
    }
    .folder-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
        margin-top: var(--space-lg);
    }
    .color-swatches {
        display: flex;
        gap: var(--space-sm);
        flex-wrap: wrap;
    }
    .swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.15s;
    }
    .swatch:hover { transform: scale(1.15); }
    .swatch.active { border-color: var(--text); box-shadow: 0 0 0 2px var(--card-bg); }

    /* Move-to folder list */
    .move-folder-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .move-folder-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        background: none;
        border: none;
        border-radius: var(--radius-md);
        color: var(--text);
        cursor: pointer;
        font-size: var(--text-base);
        text-align: left;
        width: 100%;
        transition: background 0.15s;
    }
    .move-folder-item:hover { background: var(--bg-secondary); }
`;
document.head.appendChild(fileExplorerStyles);

// Export for use in other scripts
window.FileExplorer = FileExplorer;

// Advanced File Explorer Module for Dev-Journal
const FileExplorer = {
    // State
    currentView: 'grid', // 'grid' or 'list'
    selectedItems: [],
    focusedItem: null,
    favorites: [],
    sortBy: 'date', // 'date', 'title', 'category'
    sortOrder: 'desc',
    contextMenuOpen: false,

    // Initialize file explorer
    init() {
        this.loadFavorites();
        this.setupKeyboardNav();
        this.setupContextMenu();
        this.setupDragDrop();
        this.setupViewToggle();
        this.setupSorting();
        this.renderQuickAccess();
    },

    // Load favorites from localStorage
    loadFavorites() {
        const saved = localStorage.getItem('devjournal_favorites');
        this.favorites = saved ? JSON.parse(saved) : [];
    },

    // Save favorites to localStorage
    saveFavorites() {
        localStorage.setItem('devjournal_favorites', JSON.stringify(this.favorites));
    },

    // Add to favorites
    addToFavorites(entryId, title) {
        if (!this.favorites.find(f => f.id === entryId)) {
            this.favorites.push({ id: entryId, title });
            this.saveFavorites();
            this.renderQuickAccess();
            this.showToast('Added to favorites');
        }
    },

    // Remove from favorites
    removeFromFavorites(entryId) {
        this.favorites = this.favorites.filter(f => f.id !== entryId);
        this.saveFavorites();
        this.renderQuickAccess();
        this.showToast('Removed from favorites');
    },

    // Check if entry is favorited
    isFavorite(entryId) {
        return this.favorites.some(f => f.id === entryId);
    },

    // Render quick access sidebar
    renderQuickAccess() {
        const container = document.getElementById('quickAccess');
        if (!container) return;

        const categories = [
            { id: 'daily-learning', icon: '&#128218;', name: 'Daily Learning' },
            { id: 'project-note', icon: '&#128193;', name: 'Project Notes' },
            { id: 'bug-fix', icon: '&#128027;', name: 'Bug Fixes' },
            { id: 'code-snippet', icon: '&#128187;', name: 'Code Snippets' },
            { id: 'concept', icon: '&#128161;', name: 'Concepts' }
        ];

        container.innerHTML = `
            <div class="quick-access-section">
                <h3 class="quick-access-title">&#9733; Favorites</h3>
                <ul class="quick-access-list" role="list">
                    ${this.favorites.length ? this.favorites.map(f => `
                        <li>
                            <a href="/entry/${f.id}" class="quick-access-item" data-entry-id="${f.id}">
                                <span class="item-icon">&#128196;</span>
                                <span class="item-text">${this.escapeHtml(f.title)}</span>
                            </a>
                        </li>
                    `).join('') : '<li class="no-favorites">No favorites yet</li>'}
                </ul>
            </div>
            <div class="quick-access-section">
                <h3 class="quick-access-title">&#128193; Categories</h3>
                <ul class="quick-access-list" role="list">
                    ${categories.map(cat => `
                        <li>
                            <a href="/?category=${cat.id}" class="quick-access-item" data-category="${cat.id}">
                                <span class="item-icon">${cat.icon}</span>
                                <span class="item-text">${cat.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="quick-access-section">
                <h3 class="quick-access-title">&#128337; Quick Links</h3>
                <ul class="quick-access-list" role="list">
                    <li>
                        <a href="/new" class="quick-access-item">
                            <span class="item-icon">&#10133;</span>
                            <span class="item-text">New Entry</span>
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard" class="quick-access-item">
                            <span class="item-icon">&#128202;</span>
                            <span class="item-text">Dashboard</span>
                        </a>
                    </li>
                </ul>
            </div>
        `;
    },

    // Setup keyboard navigation
    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            const entriesGrid = document.querySelector('.entries-grid, .entries-list');
            if (!entriesGrid) return;

            const items = Array.from(entriesGrid.querySelectorAll('.entry-card, .entry-list-item'));
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
                case 'ArrowRight':
                case 'l':
                    if (this.currentView === 'grid') {
                        e.preventDefault();
                        this.focusItem(items, currentIndex + 1);
                    }
                    break;
                case 'ArrowLeft':
                case 'h':
                    if (this.currentView === 'grid') {
                        e.preventDefault();
                        this.focusItem(items, currentIndex - 1);
                    }
                    break;
                case 'Enter':
                    if (this.focusedItem) {
                        const link = this.focusedItem.querySelector('a');
                        if (link) link.click();
                    }
                    break;
                case 'f':
                    if (e.ctrlKey && this.focusedItem) {
                        e.preventDefault();
                        const entryId = this.focusedItem.dataset.entryId;
                        const title = this.focusedItem.querySelector('.entry-title')?.textContent;
                        if (entryId && title) {
                            if (this.isFavorite(entryId)) {
                                this.removeFromFavorites(entryId);
                            } else {
                                this.addToFavorites(entryId, title);
                            }
                        }
                    }
                    break;
                case 'Delete':
                case 'Backspace':
                    if (this.focusedItem && e.ctrlKey) {
                        e.preventDefault();
                        const entryId = this.focusedItem.dataset.entryId;
                        if (entryId && confirm('Delete this entry?')) {
                            this.deleteEntry(entryId);
                        }
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
                <li role="menuitem" data-action="open"><span>&#128194;</span> Open</li>
                <li role="menuitem" data-action="edit"><span>&#9998;</span> Edit</li>
                <li role="menuitem" data-action="favorite"><span>&#9733;</span> Toggle Favorite</li>
                <li class="divider"></li>
                <li role="menuitem" data-action="delete" class="danger"><span>&#128465;</span> Delete</li>
            </ul>
        `;
        document.body.appendChild(menu);

        // Handle right-click on entries
        document.addEventListener('contextmenu', (e) => {
            const entryCard = e.target.closest('.entry-card, .entry-list-item');
            if (entryCard) {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, entryCard);
            }
        });

        // Handle context menu actions
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action || !this.contextMenuTarget) return;

            const entryId = this.contextMenuTarget.dataset.entryId;
            const title = this.contextMenuTarget.querySelector('.entry-title')?.textContent;

            switch (action) {
                case 'open':
                    window.location.href = `/entry/${entryId}`;
                    break;
                case 'edit':
                    window.location.href = `/edit/${entryId}`;
                    break;
                case 'favorite':
                    if (this.isFavorite(entryId)) {
                        this.removeFromFavorites(entryId);
                    } else {
                        this.addToFavorites(entryId, title);
                    }
                    break;
                case 'delete':
                    if (confirm('Are you sure you want to delete this entry?')) {
                        this.deleteEntry(entryId);
                    }
                    break;
            }

            this.closeContextMenu();
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.closeContextMenu();
            }
        });
    },

    // Show context menu
    showContextMenu(x, y, target) {
        const menu = document.getElementById('contextMenu');
        if (!menu) return;

        this.contextMenuTarget = target;
        this.contextMenuOpen = true;

        // Update favorite text
        const entryId = target.dataset.entryId;
        const favItem = menu.querySelector('[data-action="favorite"]');
        if (favItem) {
            favItem.innerHTML = this.isFavorite(entryId)
                ? '<span>&#9734;</span> Remove from Favorites'
                : '<span>&#9733;</span> Add to Favorites';
        }

        // Position menu
        menu.style.display = 'block';

        // Adjust position if menu would go off screen
        const menuRect = menu.getBoundingClientRect();
        if (x + menuRect.width > window.innerWidth) {
            x = window.innerWidth - menuRect.width - 10;
        }
        if (y + menuRect.height > window.innerHeight) {
            y = window.innerHeight - menuRect.height - 10;
        }

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
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

    // Setup drag and drop
    setupDragDrop() {
        document.addEventListener('dragstart', (e) => {
            const entryCard = e.target.closest('.entry-card, .entry-list-item');
            if (entryCard) {
                e.dataTransfer.setData('text/plain', entryCard.dataset.entryId);
                e.dataTransfer.effectAllowed = 'move';
                entryCard.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            const entryCard = e.target.closest('.entry-card, .entry-list-item');
            if (entryCard) {
                entryCard.classList.remove('dragging');
            }
        });

        // Allow dropping on quick access favorites
        const quickAccess = document.getElementById('quickAccess');
        if (quickAccess) {
            quickAccess.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            });

            quickAccess.addEventListener('drop', (e) => {
                e.preventDefault();
                const entryId = e.dataTransfer.getData('text/plain');
                const entryCard = document.querySelector(`[data-entry-id="${entryId}"]`);
                if (entryCard) {
                    const title = entryCard.querySelector('.entry-title')?.textContent;
                    if (title) {
                        this.addToFavorites(entryId, title);
                    }
                }
            });
        }
    },

    // Setup view toggle (grid/list)
    setupViewToggle() {
        const toggleBtn = document.getElementById('viewToggle');
        if (!toggleBtn) return;

        // Load saved preference
        const savedView = localStorage.getItem('devjournal_view');
        if (savedView) {
            this.currentView = savedView;
            this.applyView();
        }

        toggleBtn.addEventListener('click', () => {
            this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
            localStorage.setItem('devjournal_view', this.currentView);
            this.applyView();
        });
    },

    // Apply current view
    applyView() {
        const container = document.querySelector('.entries-container');
        const toggleBtn = document.getElementById('viewToggle');

        if (container) {
            container.classList.remove('grid-view', 'list-view');
            container.classList.add(`${this.currentView}-view`);
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = this.currentView === 'grid'
                ? '&#9776; List View'
                : '&#9783; Grid View';
        }
    },

    // Setup sorting
    setupSorting() {
        const sortSelect = document.getElementById('sortSelect');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', () => {
            const [sortBy, sortOrder] = sortSelect.value.split('-');
            this.sortBy = sortBy;
            this.sortOrder = sortOrder;
            // Trigger re-fetch of entries
            if (typeof loadEntries === 'function') {
                loadEntries();
            }
        });
    },

    // Delete entry
    async deleteEntry(entryId) {
        try {
            const response = await fetch(`/api/entries/${entryId}`, {
                method: 'DELETE',
                headers: Auth.getAuthHeader()
            });

            const result = await response.json();

            if (result.success) {
                // Remove from DOM
                const card = document.querySelector(`[data-entry-id="${entryId}"]`);
                if (card) {
                    card.remove();
                }
                // Remove from favorites if present
                this.removeFromFavorites(entryId);
                this.showToast('Entry deleted');
            } else {
                this.showToast('Failed to delete entry', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Failed to delete entry', 'error');
        }
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
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

    /* Quick Access Sidebar */
    .quick-access {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-md);
    }

    .quick-access-section {
        margin-bottom: var(--space-lg);
    }

    .quick-access-section:last-child {
        margin-bottom: 0;
    }

    .quick-access-title {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-bottom: var(--space-sm);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .quick-access-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .quick-access-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        color: var(--text);
        text-decoration: none;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .quick-access-item:hover {
        background: var(--bg-secondary);
        color: var(--primary);
    }

    .quick-access-item .item-icon {
        flex-shrink: 0;
    }

    .quick-access-item .item-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .no-favorites {
        color: var(--text-muted);
        font-size: var(--text-sm);
        font-style: italic;
        padding: var(--space-sm);
    }

    /* Entry Card States */
    .entry-card.focused,
    .entry-list-item.focused {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }

    .entry-card.selected,
    .entry-list-item.selected {
        background: rgba(59, 130, 246, 0.1);
    }

    .entry-card.dragging,
    .entry-list-item.dragging {
        opacity: 0.5;
    }

    /* List View */
    .entries-container.list-view .entries-grid {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .entries-container.list-view .entry-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: var(--space-md);
    }

    .entries-container.list-view .entry-card .entry-content {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        flex: 1;
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
`;
document.head.appendChild(fileExplorerStyles);

// Export for use in other scripts
window.FileExplorer = FileExplorer;

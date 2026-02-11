// Dev-Journal Frontend JavaScript

const API_BASE = '/api/entries';
const EXPLORER_API = '/api/explorer';
const AI_API = '/api/ai';

// Utility Functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getCategoryIcon = (category) => {
    const icons = {
        'daily-learning': '&#128218;',
        'project-note': '&#128196;',
        'bug-fix': '&#128027;',
        'code-snippet': '&#128187;',
        'concept': '&#128161;'
    };
    return icons[category] || '&#128196;';
};

const getCategoryLabel = (category) => {
    const labels = {
        'daily-learning': 'Daily Learning',
        'project-note': 'Project Note',
        'bug-fix': 'Bug Fix',
        'code-snippet': 'Code Snippet',
        'concept': 'Concept'
    };
    return labels[category] || category;
};

// Get icon for file or folder entry
const getEntryIcon = (entry) => {
    if (entry.type === 'folder') {
        return '&#128193;';
    }
    // File icons based on mime or legacy category
    if (entry.category) return getCategoryIcon(entry.category);
    if (entry.mime === 'text/markdown') return '&#128196;';
    return '&#128196;';
};

const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// HTML Escape function to prevent XSS
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Auto-detect and render code blocks in content
const detectAndRenderCode = (content) => {
    // Detect ```language code blocks (fenced code blocks)
    content = content.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'code';
        const escapedCode = escapeHtml(code.trim());
        return `<div class="code-block-wrapper">
            <div class="code-header">
                <span class="code-lang">${language}</span>
                <button class="copy-btn" onclick="copyCodeBlock(this)" data-code="${btoa(encodeURIComponent(code.trim()))}">&#128203; Copy</button>
            </div>
            <pre class="code-block"><code class="language-${language}">${escapedCode}</code></pre>
        </div>`;
    });

    // Detect inline `code` (but not inside code blocks)
    content = content.replace(/`([^`\n]+)`/g, (m, code) => '<code class="inline-code">' + escapeHtml(code) + '</code>');

    return content;
};

// Copy code block to clipboard
const copyCodeBlock = (btn) => {
    try {
        const encodedCode = btn.getAttribute('data-code');
        const code = decodeURIComponent(atob(encodedCode));
        navigator.clipboard.writeText(code).then(() => {
            btn.innerHTML = '&#10003; Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = '&#128203; Copy';
                btn.classList.remove('copied');
            }, 2000);
        });
    } catch (error) {
        console.error('Failed to copy code:', error);
    }
};

// Make copyCodeBlock globally available
window.copyCodeBlock = copyCodeBlock;

// Render content with markdown-like formatting
const renderContent = (content) => {
    // First detect and render code blocks
    let rendered = detectAndRenderCode(content);

    // Convert line breaks to paragraphs (for non-code content)
    rendered = rendered.split('\n').map(line => {
        // Skip if it's inside a code block wrapper
        if (line.includes('code-block-wrapper') || line.includes('</pre>') || line.includes('<pre')) {
            return line;
        }
        return line.trim() ? `<p>${line}</p>` : '';
    }).join('');

    return rendered;
};

// ========================================
// EXPLORER API FUNCTIONS
// ========================================

const ExplorerAPI = {
    async getRoot(sort = 'name', order = 'asc') {
        const res = await fetch(`${EXPLORER_API}/root?sort=${sort}&order=${order}`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async getFolder(folderId, sort = 'name', order = 'asc') {
        const res = await fetch(`${EXPLORER_API}/folder/${folderId}?sort=${sort}&order=${order}`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async getBreadcrumb(entryId) {
        const res = await fetch(`${EXPLORER_API}/breadcrumb/${entryId}`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async createFile(data) {
        const res = await fetch(`${EXPLORER_API}/file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async createFolder(name, parentId = null) {
        const res = await fetch(`${EXPLORER_API}/folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify({ name, parentId })
        });
        return res.json();
    },

    async updateEntry(id, data) {
        const res = await fetch(`${EXPLORER_API}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteEntry(id) {
        const res = await fetch(`${EXPLORER_API}/${id}`, {
            method: 'DELETE',
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async moveEntry(id, newParentId) {
        const res = await fetch(`${EXPLORER_API}/${id}/move`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify({ newParentId })
        });
        return res.json();
    },

    async search(query) {
        const res = await fetch(`${EXPLORER_API}/search?q=${encodeURIComponent(query)}`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async getFavorites() {
        const res = await fetch(`${EXPLORER_API}/favorites`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async getRecent(limit = 20) {
        const res = await fetch(`${EXPLORER_API}/recent?limit=${limit}`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    },

    async getTags() {
        const res = await fetch(`${EXPLORER_API}/tags`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    }
};

window.ExplorerAPI = ExplorerAPI;

// ========================================
// ATLAS AI API FUNCTIONS (thin client calls)
// ========================================

const AiAPI = {
    async summarize(folderId) {
        const res = await fetch(`${AI_API}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify({ folderId })
        });
        return res.json();
    },

    async explain(entryId) {
        const res = await fetch(`${AI_API}/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify({ entryId })
        });
        return res.json();
    },

    async quickHelp(question, entryId = null) {
        const res = await fetch(`${AI_API}/quick-help`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
            body: JSON.stringify({ question, entryId })
        });
        return res.json();
    },

    async getStatus() {
        const res = await fetch(`${AI_API}/status`, {
            headers: Auth.getAuthHeader()
        });
        return res.json();
    }
};

window.AiAPI = AiAPI;

// ========================================
// AI PANEL (modal for showing AI responses)
// ========================================

const AiPanel = {
    _modal: null,

    getModal() {
        if (this._modal) return this._modal;
        // Create modal on first use
        const modal = document.createElement('div');
        modal.id = 'aiModal';
        modal.className = 'ai-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'aiModalTitle');
        modal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-modal-header">
                    <h3 class="ai-modal-title" id="aiModalTitle">Atlas AI</h3>
                    <button class="ai-modal-close" id="aiModalClose" aria-label="Close AI panel">&times;</button>
                </div>
                <div class="ai-modal-body" id="aiModalBody">
                    <div class="ai-loading" id="aiLoading">
                        <div class="win11-spinner"></div>
                        <p>Thinking...</p>
                    </div>
                    <div class="ai-result" id="aiResult"></div>
                </div>
                <div class="ai-modal-footer">
                    <div class="ai-quick-ask">
                        <input type="text" id="aiQuickInput" placeholder="Ask AI a question..." />
                        <button id="aiQuickSend" class="toolbar-btn primary">Ask</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('#aiModalClose').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => { if (e.target === modal) this.close(); });

        // Escape key to close
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { this.close(); return; }
            // Focus trap: keep Tab/Shift+Tab within modal
            if (e.key === 'Tab') {
                const focusable = modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Quick ask
        const sendBtn = modal.querySelector('#aiQuickSend');
        const input = modal.querySelector('#aiQuickInput');
        sendBtn.addEventListener('click', () => this.askQuick());
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.askQuick(); });

        this._modal = modal;
        return modal;
    },

    _previousFocus: null,

    open(title) {
        this._previousFocus = document.activeElement;
        const modal = this.getModal();
        if (title) modal.querySelector('.ai-modal-title').textContent = title;
        modal.querySelector('#aiLoading').style.display = 'flex';
        modal.querySelector('#aiResult').innerHTML = '';
        modal.style.display = 'flex';
        // Move focus into modal
        modal.querySelector('#aiModalClose').focus();
    },

    showResult(content) {
        const modal = this.getModal();
        modal.querySelector('#aiLoading').style.display = 'none';
        modal.querySelector('#aiResult').innerHTML = `<div class="ai-content">${renderContent(content)}</div>`;
    },

    showError(message) {
        const modal = this.getModal();
        modal.querySelector('#aiLoading').style.display = 'none';
        modal.querySelector('#aiResult').innerHTML = `<div class="ai-error">${escapeHtml(message)}</div>`;
    },

    close() {
        const modal = this.getModal();
        modal.style.display = 'none';
        if (this._previousFocus) {
            this._previousFocus.focus();
            this._previousFocus = null;
        }
    },

    async askQuick() {
        const input = this.getModal().querySelector('#aiQuickInput');
        const question = input.value.trim();
        if (!question) return;

        input.value = '';
        this.open('Ask AI');
        try {
            // Get current entry ID if on entry page
            const urlParams = new URLSearchParams(window.location.search);
            const entryId = urlParams.get('id');

            const result = await AiAPI.quickHelp(question, entryId);
            if (result.success) {
                this.showResult(result.data.content);
            } else {
                this.showError(result.error || 'AI request failed');
            }
        } catch (error) {
            this.showError(error.message);
        }
    },

    async summarizeFolder(folderId) {
        this.open('Summarize Folder');
        try {
            const result = await AiAPI.summarize(folderId);
            if (result.success) {
                this.showResult(result.data.content);
            } else {
                this.showError(result.error || 'AI request failed');
            }
        } catch (error) {
            this.showError(error.message);
        }
    },

    async explainEntry(entryId) {
        this.open('Explain Entry');
        try {
            const result = await AiAPI.explain(entryId);
            if (result.success) {
                this.showResult(result.data.content);
            } else {
                this.showError(result.error || 'AI request failed');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }
};

window.AiPanel = AiPanel;

// ========================================
// LEGACY API FUNCTIONS (for entry/edit pages)
// ========================================

const fetchEntries = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
    const response = await fetch(url, {
        headers: Auth.getAuthHeader()
    });
    return response.json();
};

const fetchEntry = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        headers: Auth.getAuthHeader()
    });
    return response.json();
};

const createEntry = async (data) => {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...Auth.getAuthHeader()
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

const updateEntry = async (id, data) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...Auth.getAuthHeader()
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

const deleteEntry = async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: Auth.getAuthHeader()
    });
    return response.json();
};

const searchEntries = async (query) => {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
        headers: Auth.getAuthHeader()
    });
    return response.json();
};

const fetchTags = async () => {
    const response = await fetch(`${API_BASE}/tags`, {
        headers: Auth.getAuthHeader()
    });
    return response.json();
};

const fetchStats = async () => {
    const response = await fetch(`${API_BASE}/stats`, {
        headers: Auth.getAuthHeader()
    });
    return response.json();
};

// DOM Elements
const getElement = (id) => document.getElementById(id);

// ========================================
// LEGACY PAGE FUNCTIONS (entry view, edit, create)
// ========================================

const renderEntryCard = (entry) => {
    const tagsHtml = entry.tags && entry.tags.length > 0
        ? entry.tags.slice(0, 3).map(tag => `<span class="entry-tag">${tag}</span>`).join('')
        : '';

    return `
        <a href="/entry/${entry._id}" class="entry-card">
            <div class="entry-card-header">
                <span class="entry-category ${entry.category}">${getCategoryLabel(entry.category)}</span>
            </div>
            <h3>${entry.title || entry.name}</h3>
            <p>${truncateText(entry.content)}</p>
            <div class="entry-card-footer">
                <span class="entry-date">${formatDate(entry.createdAt)}</span>
                <div class="entry-tags">${tagsHtml}</div>
            </div>
        </a>
    `;
};

const loadEntries = async (category = '') => {
    const entriesGrid = getElement('entriesGrid');
    const loadingIndicator = getElement('loadingIndicator');
    const noEntries = getElement('noEntries');
    const entryCount = getElement('entryCount');
    const contentTitle = getElement('contentTitle');

    if (!entriesGrid) return;

    loadingIndicator.style.display = 'block';
    noEntries.style.display = 'none';
    entriesGrid.innerHTML = '';

    try {
        const params = category ? { category } : {};
        const result = await fetchEntries(params);

        loadingIndicator.style.display = 'none';

        if (result.success && result.data.length > 0) {
            entriesGrid.innerHTML = result.data.map(renderEntryCard).join('');
            entryCount.textContent = `${result.pagination.total} entries`;
        } else {
            noEntries.style.display = 'block';
            entryCount.textContent = '0 entries';
        }

        contentTitle.textContent = category
            ? getCategoryLabel(category)
            : 'All Entries';
    } catch (error) {
        loadingIndicator.style.display = 'none';
        entriesGrid.innerHTML = `<p class="error">Error loading entries: ${error.message}</p>`;
    }
};

const loadTags = async () => {
    const tagCloud = getElement('tagCloud');
    if (!tagCloud) return;

    try {
        const result = await fetchTags();
        if (result.success && result.data.length > 0) {
            tagCloud.innerHTML = result.data.map(tag =>
                `<span class="tag" data-tag="${tag}">${tag}</span>`
            ).join('');

            // Add click handlers
            tagCloud.querySelectorAll('.tag').forEach(tagEl => {
                tagEl.addEventListener('click', () => {
                    loadEntriesByTag(tagEl.dataset.tag);
                });
            });
        } else {
            tagCloud.innerHTML = '<p class="no-tags">No tags yet</p>';
        }
    } catch (error) {
        tagCloud.innerHTML = '<p class="error">Error loading tags</p>';
    }
};

const loadEntriesByTag = async (tag) => {
    const entriesGrid = getElement('entriesGrid');
    const loadingIndicator = getElement('loadingIndicator');
    const noEntries = getElement('noEntries');
    const entryCount = getElement('entryCount');
    const contentTitle = getElement('contentTitle');

    if (!entriesGrid) return;

    loadingIndicator.style.display = 'block';
    noEntries.style.display = 'none';
    entriesGrid.innerHTML = '';

    try {
        const result = await fetchEntries({ tag });

        loadingIndicator.style.display = 'none';

        if (result.success && result.data.length > 0) {
            entriesGrid.innerHTML = result.data.map(renderEntryCard).join('');
            entryCount.textContent = `${result.pagination.total} entries`;
        } else {
            noEntries.style.display = 'block';
            entryCount.textContent = '0 entries';
        }

        contentTitle.textContent = `Tag: ${tag}`;
    } catch (error) {
        loadingIndicator.style.display = 'none';
        entriesGrid.innerHTML = `<p class="error">Error loading entries: ${error.message}</p>`;
    }
};

const loadStats = async () => {
    const categoryStats = getElement('categoryStats');
    if (!categoryStats) return;

    try {
        const result = await fetchStats();
        if (result.success) {
            categoryStats.innerHTML = result.data.map(stat =>
                `<div class="stat-item">
                    <span>${getCategoryLabel(stat._id)}</span>
                    <span class="stat-count">${stat.count}</span>
                </div>`
            ).join('');
        }
    } catch (error) {
        categoryStats.innerHTML = '<p class="error">Error loading stats</p>';
    }
};

// Category Filter
const setupCategoryFilter = () => {
    const categoryList = document.querySelector('.category-list');
    if (!categoryList) return;

    categoryList.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link) return;

        // Update active state
        categoryList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');

        // Load entries for category
        const category = link.dataset.category;
        loadEntries(category);
    });
};

// Search (legacy)
const setupSearch = () => {
    const searchInput = getElement('searchInput');
    const searchBtn = getElement('searchBtn');

    if (!searchInput || !searchBtn) return;

    const performSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            // If on Win11 explorer, reload current folder
            if (document.querySelector('.win11-explorer')) {
                Win11.loadCurrentView();
            } else {
                loadEntries();
            }
            return;
        }

        const fileList = document.getElementById('fileList');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const itemCount = document.getElementById('itemCount');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');

        if (fileList) {
            // Win11 explorer search
            loadingState.style.display = 'flex';
            emptyState.style.display = 'none';
            fileList.innerHTML = '';

            try {
                const result = await ExplorerAPI.search(query);

                loadingState.style.display = 'none';

                if (result.success && result.data.length > 0) {
                    fileList.innerHTML = result.data.map(renderFileItem).join('');
                    itemCount.textContent = `${result.data.length} results`;
                } else {
                    emptyState.style.display = 'flex';
                    itemCount.textContent = '0 results';
                }

                if (breadcrumbCurrent) {
                    breadcrumbCurrent.textContent = `Search: "${query}"`;
                }
            } catch (error) {
                loadingState.style.display = 'none';
                fileList.innerHTML = `<p class="error" style="padding: var(--space-lg);">Error: ${escapeHtml(error.message)}</p>`;
            }
        } else {
            // Legacy search
            const entriesGrid = getElement('entriesGrid');
            const legacyLoading = getElement('loadingIndicator');
            const noEntries = getElement('noEntries');
            const entryCount = getElement('entryCount');
            const contentTitle = getElement('contentTitle');

            legacyLoading.style.display = 'block';
            noEntries.style.display = 'none';
            entriesGrid.innerHTML = '';

            try {
                const result = await searchEntries(query);
                legacyLoading.style.display = 'none';

                if (result.success && result.data.length > 0) {
                    entriesGrid.innerHTML = result.data.map(renderEntryCard).join('');
                    entryCount.textContent = `${result.data.length} results`;
                } else {
                    noEntries.style.display = 'block';
                    entryCount.textContent = '0 results';
                }
                contentTitle.textContent = `Search: "${query}"`;
            } catch (error) {
                legacyLoading.style.display = 'none';
                entriesGrid.innerHTML = `<p class="error">Error searching: ${error.message}</p>`;
            }
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.blur();
            if (document.querySelector('.win11-explorer')) {
                Win11.loadCurrentView();
            } else {
                loadEntries();
            }
        }
    });
};

// Form Handling - Create Entry
const setupCreateForm = () => {
    const form = getElement('entryForm');
    if (!form) return;

    let submitting = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitting) return;
        submitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const formMessage = getElement('formMessage');

        // Support both legacy (title/category) and new (name/parentId) creation
        const titleEl = getElement('title');
        const categoryEl = getElement('category');
        const parentIdEl = getElement('parentId');

        const data = {
            title: titleEl ? titleEl.value.trim() : '',
            name: titleEl ? titleEl.value.trim() : '',
            category: categoryEl ? categoryEl.value : '',
            parentId: parentIdEl ? parentIdEl.value || null : null,
            content: getElement('content').value.trim(),
            tags: getElement('tags').value.split(',').map(t => t.trim()).filter(t => t),
            codeLanguage: getElement('codeLanguage') ? getElement('codeLanguage').value.trim() : '',
            codeBlock: getElement('codeBlock') ? getElement('codeBlock').value : ''
        };

        try {
            // Use explorer API for file creation
            const result = await ExplorerAPI.createFile(data);

            if (result.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Entry created successfully!';
                formMessage.style.display = 'block';

                setTimeout(() => {
                    window.location.href = `/entry/${result.data._id}`;
                }, 1000);
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = result.error || 'Error creating entry';
                formMessage.style.display = 'block';
                submitting = false;
                if (submitBtn) submitBtn.disabled = false;
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Error creating entry: ' + error.message;
            formMessage.style.display = 'block';
            submitting = false;
            if (submitBtn) submitBtn.disabled = false;
        }
    });
};

// Form Handling - Edit Entry
const setupEditForm = () => {
    const form = getElement('editForm');
    const loadingIndicator = getElement('loadingIndicator');
    if (!form) return;

    // Get entry ID from URL
    const pathParts = window.location.pathname.split('/');
    const entryId = pathParts[pathParts.length - 1];

    // Load entry data
    const loadEntryData = async () => {
        try {
            const result = await fetchEntry(entryId);

            if (result.success) {
                const entry = result.data;
                getElement('entryId').value = entry._id;
                const titleEl = getElement('title');
                if (titleEl) titleEl.value = entry.title || entry.name || '';
                const categoryEl = getElement('category');
                if (categoryEl) categoryEl.value = entry.category || '';
                getElement('content').value = entry.content;
                getElement('tags').value = entry.tags ? entry.tags.join(', ') : '';
                const codeLangEl = getElement('codeLanguage');
                if (codeLangEl) codeLangEl.value = entry.codeLanguage || '';
                const codeBlockEl = getElement('codeBlock');
                if (codeBlockEl) codeBlockEl.value = entry.codeBlock || '';

                loadingIndicator.style.display = 'none';
                form.style.display = 'block';
            } else {
                loadingIndicator.innerHTML = '<p class="error">Entry not found</p>';
            }
        } catch (error) {
            loadingIndicator.innerHTML = `<p class="error">Error loading entry: ${error.message}</p>`;
        }
    };

    loadEntryData();

    // Handle form submission
    let submitting = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitting) return;
        submitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const formMessage = getElement('formMessage');
        const id = getElement('entryId').value;

        const data = {
            name: getElement('title') ? getElement('title').value.trim() : '',
            content: getElement('content').value.trim(),
            tags: getElement('tags').value.split(',').map(t => t.trim()).filter(t => t),
            codeLanguage: getElement('codeLanguage') ? getElement('codeLanguage').value.trim() : '',
            codeBlock: getElement('codeBlock') ? getElement('codeBlock').value : ''
        };

        try {
            // Use explorer API for updates
            const result = await ExplorerAPI.updateEntry(id, data);

            if (result.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Entry updated successfully!';
                formMessage.style.display = 'block';

                setTimeout(() => {
                    window.location.href = `/entry/${id}`;
                }, 1000);
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = result.error || 'Error updating entry';
                formMessage.style.display = 'block';
                submitting = false;
                if (submitBtn) submitBtn.disabled = false;
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Error updating entry: ' + error.message;
            formMessage.style.display = 'block';
            submitting = false;
            if (submitBtn) submitBtn.disabled = false;
        }
    });
};

// Entry View Page
const setupEntryView = () => {
    const entryContent = getElement('entryContent');
    if (!entryContent) return;

    // Get entry ID from URL
    const pathParts = window.location.pathname.split('/');
    const entryId = pathParts[pathParts.length - 1];

    const loadEntryView = async () => {
        try {
            const result = await fetchEntry(entryId);

            if (result.success) {
                const entry = result.data;
                const displayName = entry.name || entry.title || 'Untitled';
                const displayCategory = entry.category ? getCategoryLabel(entry.category) : (entry.type || 'file');

                // Update header
                getElement('entryTitle').innerHTML = `<span class="logo-icon">${getEntryIcon(entry)}</span> ${displayName}`;
                getElement('entryMeta').textContent = `${displayCategory} - ${formatDate(entry.createdAt)}`;

                // Update content with auto-detected code blocks
                entryContent.innerHTML = `
                    <div class="content-body">
                        ${renderContent(entry.content)}
                    </div>
                `;

                // Update details
                getElement('entryDetails').innerHTML = `
                    <div class="detail-row">
                        <span class="detail-label">Type</span>
                        <span class="detail-value">${entry.type || 'file'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${formatDate(entry.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Updated</span>
                        <span class="detail-value">${formatDate(entry.updatedAt)}</span>
                    </div>
                `;

                // Update tags
                if (entry.tags && entry.tags.length > 0) {
                    getElement('tagsSection').style.display = 'block';
                    getElement('entryTags').innerHTML = entry.tags.map(tag =>
                        `<span class="tag">${tag}</span>`
                    ).join('');
                }

                // Update code block
                if (entry.codeBlock) {
                    getElement('codeSection').style.display = 'block';
                    getElement('codeLanguageLabel').textContent = entry.codeLanguage || 'Code';
                    getElement('entryCodeBlock').textContent = entry.codeBlock;

                    // Setup copy button
                    getElement('copyCodeBtn').addEventListener('click', () => {
                        navigator.clipboard.writeText(entry.codeBlock);
                        getElement('copyCodeBtn').textContent = 'Copied!';
                        setTimeout(() => {
                            getElement('copyCodeBtn').innerHTML = '&#128203; Copy';
                        }, 2000);
                    });
                }

                // Setup edit button
                getElement('editBtn').href = `/edit/${entry._id}`;

                // Setup delete button
                setupDeleteModal(entry._id, entry.type);

                // Setup AI explain button — navigate to dedicated explain page
                const explainBtn = getElement('explainBtn');
                if (explainBtn) {
                    explainBtn.addEventListener('click', () => {
                        window.location.href = '/explain/' + entry._id;
                    });
                }

            } else {
                entryContent.innerHTML = '<p class="error">Entry not found</p>';
            }
        } catch (error) {
            entryContent.innerHTML = `<p class="error">Error loading entry: ${error.message}</p>`;
        }
    };

    loadEntryView();
};

// Delete Modal
const setupDeleteModal = (entryId, entryType) => {
    const deleteBtn = getElement('deleteBtn');
    const deleteModal = getElement('deleteModal');
    const cancelDelete = getElement('cancelDelete');
    const confirmDelete = getElement('confirmDelete');

    if (!deleteBtn || !deleteModal) return;

    let previousFocus = null;

    const closeDeleteModal = () => {
        deleteModal.style.display = 'none';
        if (previousFocus) { previousFocus.focus(); previousFocus = null; }
    };

    deleteBtn.addEventListener('click', () => {
        previousFocus = document.activeElement;
        deleteModal.style.display = 'flex';
        cancelDelete.focus();
    });

    cancelDelete.addEventListener('click', closeDeleteModal);

    confirmDelete.addEventListener('click', async () => {
        try {
            const result = await ExplorerAPI.deleteEntry(entryId);

            if (result.success) {
                window.location.href = '/';
            } else {
                alert('Error deleting entry: ' + (result.error || 'Unknown error'));
                closeDeleteModal();
            }
        } catch (error) {
            alert('Error deleting entry: ' + error.message);
            closeDeleteModal();
        }
    });

    // Close modal on outside click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    // Escape key + focus trap
    deleteModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeDeleteModal(); return; }
        if (e.key === 'Tab') {
            const focusable = deleteModal.querySelectorAll('button');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        }
    });
};

// Mobile Menu Toggle
const setupMobileMenu = () => {
    const mobileMenuBtn = getElement('mobileMenuBtn');
    const navActions = getElement('navActions');

    if (!mobileMenuBtn || !navActions) return;

    mobileMenuBtn.setAttribute('aria-expanded', 'false');

    const closeMenu = () => {
        mobileMenuBtn.classList.remove('active');
        navActions.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    };

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = navActions.classList.contains('open');
        mobileMenuBtn.classList.toggle('active');
        navActions.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navActions.classList.contains('open')) {
            closeMenu();
            mobileMenuBtn.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !navActions.contains(e.target)) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
};

// Setup logout button
const setupLogout = () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }

    // Display user info
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        const user = Auth.getUser();
        if (user) {
            userDisplay.textContent = user.name || user.email;
        }
    }

    // Show admin link if user is admin
    const adminNavLink = document.getElementById('adminNavLink');
    if (adminNavLink) {
        const user = Auth.getUser();
        if (user && user.role === 'admin') {
            adminNavLink.style.display = '';
        }
    }
};

// ========================================
// WINDOWS 11 FILE EXPLORER FUNCTIONALITY
// ========================================

// Format relative date like Windows 11
const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

// Render Windows 11 style file/folder item
const renderFileItem = (entry) => {
    const isFolder = entry.type === 'folder';
    const tagsHtml = entry.tags && entry.tags.length > 0
        ? entry.tags.slice(0, 2).map(tag => `<span class="entry-tag">${escapeHtml(tag)}</span>`).join('')
        : '<span style="color: var(--win11-text-muted);">-</span>';

    const displayName = entry.name || entry.title || 'Untitled';
    const icon = getEntryIcon(entry);
    const typeLabel = isFolder ? 'Folder' : (entry.category ? getCategoryLabel(entry.category) : 'File');

    // Folders get folder-specific styling and behavior
    const itemClass = isFolder ? 'file-item folder-item' : 'file-item';
    const href = isFolder ? '#' : `/entry/${entry._id}`;
    const clickAttr = isFolder
        ? `onclick="event.preventDefault(); Win11.navigateToFolder('${entry._id}')"`
        : '';

    const pinnedIcon = entry.pinned ? '<span class="pinned-indicator" title="Pinned" aria-label="Pinned">&#128204;</span>' : '';
    const favIcon = entry.favorite ? '<span class="fav-indicator" title="Favorite" aria-label="Favorite">&#9733;</span>' : '';

    return `
        <a href="${href}" class="${itemClass}" data-entry-id="${entry._id}" data-type="${entry.type}" ${clickAttr}>
            <div class="file-name">
                <input type="checkbox" class="file-checkbox" onclick="event.stopPropagation(); Win11.toggleSelect('${entry._id}')">
                <span class="file-icon ${isFolder ? 'folder' : ''}">${icon}</span>
                <span class="file-title">${escapeHtml(displayName)}</span>
                ${pinnedIcon}${favIcon}
            </div>
            <span class="file-date">${formatRelativeDate(entry.updatedAt || entry.createdAt)}</span>
            <span class="file-category">
                <span class="category-badge ${isFolder ? 'folder-badge' : (entry.category || '')}">
                    <span class="badge-dot"></span>
                    ${typeLabel}
                </span>
            </span>
            <span class="file-tags">${isFolder ? '-' : tagsHtml}</span>
        </a>
    `;
};

// Windows 11 Explorer State
const Win11State = {
    currentTab: 'recent',
    currentFolderId: null, // null = root
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'details',
    selectedItems: [],
    history: [null], // null = root
    historyIndex: 0,
    folderMap: {} // folderId -> folder metadata cache
};

// Windows 11 Explorer Module
const Win11 = {
    _loadVersion: 0,

    // Load entries for the current view (root or folder)
    async loadFileList(folderId = null, tab = 'recent') {
        const thisVersion = ++this._loadVersion;
        const fileList = document.getElementById('fileList');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const itemCount = document.getElementById('itemCount');
        const quickAccessGrid = document.getElementById('quickAccessGrid');

        if (!fileList) return;

        loadingState.style.display = 'flex';
        emptyState.style.display = 'none';
        fileList.innerHTML = '';

        try {
            let entries = [];

            if (tab === 'favorites') {
                // Load favorites
                const result = await ExplorerAPI.getFavorites();
                if (result.success) entries = result.data;
                if (quickAccessGrid) quickAccessGrid.style.display = 'none';
            } else if (tab === 'recent') {
                if (!folderId) {
                    // Root + recent: show pinned folders grid + recent files
                    const rootResult = await ExplorerAPI.getRoot(Win11State.sortBy, Win11State.sortOrder);
                    if (rootResult.success) {
                        // Update pinned folders with real data
                        this.updatePinnedFolders(rootResult.data.filter(e => e.type === 'folder'));
                        if (quickAccessGrid) quickAccessGrid.style.display = 'block';
                    }
                    // Load recent files below the pinned grid
                    const recentResult = await ExplorerAPI.getRecent(20);
                    if (recentResult.success) entries = recentResult.data;
                } else {
                    // Inside a folder - show its contents
                    const result = await ExplorerAPI.getFolder(folderId, Win11State.sortBy, Win11State.sortOrder);
                    if (result.success) {
                        entries = result.data.children;
                        Win11State.folderMap[folderId] = result.data.folder;
                    }
                    if (quickAccessGrid) quickAccessGrid.style.display = 'none';
                }
            } else if (tab === 'all') {
                // "All" tab: show root-level entries (the full filesystem root)
                const result = await ExplorerAPI.getRoot(Win11State.sortBy, Win11State.sortOrder);
                if (result.success) entries = result.data;
                if (quickAccessGrid) quickAccessGrid.style.display = 'none';
            }

            // Discard stale response if a newer load was triggered
            if (this._loadVersion !== thisVersion) return;

            loadingState.style.display = 'none';

            if (entries.length > 0) {
                fileList.innerHTML = entries.map(renderFileItem).join('');
                itemCount.textContent = `${entries.length} items`;
            } else {
                emptyState.style.display = 'flex';
                itemCount.textContent = '0 items';
            }

            // Update sidebar folder counts
            this.updateSidebarCounts();
        } catch (error) {
            if (this._loadVersion !== thisVersion) return;
            loadingState.style.display = 'none';
            fileList.innerHTML = `<div class="error-state" style="padding: var(--space-lg); text-align: center;">
                <p class="error">Error loading entries: ${escapeHtml(error.message)}</p>
                <button onclick="Win11.loadFileList(Win11State.currentFolderId, Win11State.currentTab)" class="btn-secondary" style="margin-top: var(--space-sm);">Retry</button>
            </div>`;
        }
    },

    // Load current view (convenience method)
    loadCurrentView() {
        return this.loadFileList(Win11State.currentFolderId, Win11State.currentTab);
    },

    // Navigate into a folder (double-click)
    navigateToFolder(folderId) {
        Win11State.currentFolderId = folderId;
        Win11State.currentTab = 'recent'; // Reset tab when navigating

        // Add to history
        Win11State.history = Win11State.history.slice(0, Win11State.historyIndex + 1);
        Win11State.history.push(folderId);
        Win11State.historyIndex = Win11State.history.length - 1;
        this.updateNavButtons();

        // Update breadcrumb
        this.updateBreadcrumb(folderId);

        // Update active tab
        document.querySelectorAll('.win11-tab').forEach(t => t.classList.remove('active'));
        const recentTab = document.querySelector('.win11-tab[data-tab="recent"]');
        if (recentTab) recentTab.classList.add('active');

        // Load folder contents
        this.loadFileList(folderId, 'recent');
    },

    // Navigate to root
    navigateToRoot() {
        Win11State.currentFolderId = null;

        Win11State.history = Win11State.history.slice(0, Win11State.historyIndex + 1);
        Win11State.history.push(null);
        Win11State.historyIndex = Win11State.history.length - 1;
        this.updateNavButtons();

        this.updateBreadcrumb(null);
        this.loadFileList(null, Win11State.currentTab);
    },

    // Update pinned folders grid with real folder data
    updatePinnedFolders(folders) {
        const pinnedFolders = document.getElementById('pinnedFolders');
        if (!pinnedFolders) return;

        const folderColors = ['blue', 'green', 'red', 'purple', 'yellow', 'blue', 'green'];

        pinnedFolders.innerHTML = folders
            .filter(f => f.pinned)
            .map((folder, i) => {
                const color = folderColors[i % folderColors.length];
                Win11State.folderMap[folder._id] = folder;
                return `
                    <a href="#" class="pinned-folder" data-folder-id="${folder._id}" ondblclick="event.preventDefault(); Win11.navigateToFolder('${folder._id}')" onclick="event.preventDefault(); Win11.navigateToFolder('${folder._id}')">
                        <span class="folder-icon-lg" style="color: var(--folder-${color});">&#128193;</span>
                        <span class="folder-name">${escapeHtml(folder.name)}</span>
                        <span class="folder-count" id="pinned-count-${folder._id}">Folder</span>
                    </a>
                `;
            }).join('');
    },

    // Update sidebar folder items with real data
    async updateSidebarCounts() {
        // Load root folders to update sidebar
        try {
            const result = await ExplorerAPI.getRoot();
            if (!result.success) return;

            const sidebarQuickAccess = document.getElementById('quickaccess');
            if (!sidebarQuickAccess) return;

            const folders = result.data.filter(e => e.type === 'folder');
            const folderColors = ['blue', 'green', 'red', 'purple', 'yellow', 'blue', 'green'];

            sidebarQuickAccess.innerHTML = folders.map((folder, i) => {
                const color = folderColors[i % folderColors.length];
                const isActive = Win11State.currentFolderId === folder._id.toString();
                return `
                    <a href="#" class="sidebar-item ${isActive ? 'active' : ''}" data-folder-id="${folder._id}" onclick="event.preventDefault(); Win11.navigateToFolder('${folder._id}')">
                        <span class="item-icon folder-icon ${color}">&#128193;</span>
                        <span class="item-text">${escapeHtml(folder.name)}</span>
                    </a>
                `;
            }).join('');
        } catch (error) {
            // Silent fail for sidebar update
        }
    },

    // Update breadcrumb using explorer API
    async updateBreadcrumb(folderId) {
        const breadcrumbPath = document.getElementById('breadcrumbPath');
        if (!breadcrumbPath) return;

        if (!folderId) {
            // Root level
            breadcrumbPath.innerHTML = `
                <li><a href="#" class="breadcrumb-item" onclick="event.preventDefault(); Win11.navigateToRoot()">&#127968; Home</a></li>
                <li class="breadcrumb-separator" aria-hidden="true">&#8250;</li>
                <li aria-current="location"><span class="breadcrumb-current" id="breadcrumbCurrent">All Entries</span></li>
            `;
            return;
        }

        try {
            const result = await ExplorerAPI.getBreadcrumb(folderId);
            if (!result.success) return;

            let html = `<li><a href="#" class="breadcrumb-item" onclick="event.preventDefault(); Win11.navigateToRoot()">&#127968; Home</a></li>`;

            result.data.forEach((crumb, i) => {
                html += `<li class="breadcrumb-separator" aria-hidden="true">&#8250;</li>`;
                if (i === result.data.length - 1) {
                    html += `<li aria-current="location"><span class="breadcrumb-current" id="breadcrumbCurrent">${escapeHtml(crumb.name)}</span></li>`;
                } else {
                    html += `<li><a href="#" class="breadcrumb-item" onclick="event.preventDefault(); Win11.navigateToFolder('${crumb._id}')">${escapeHtml(crumb.name)}</a></li>`;
                }
            });

            breadcrumbPath.innerHTML = html;
        } catch (error) {
            // Fallback
            breadcrumbPath.innerHTML = `
                <li><a href="#" class="breadcrumb-item" onclick="event.preventDefault(); Win11.navigateToRoot()">&#127968; Home</a></li>
                <li class="breadcrumb-separator" aria-hidden="true">&#8250;</li>
                <li aria-current="location"><span class="breadcrumb-current" id="breadcrumbCurrent">...</span></li>
            `;
        }
    },

    // Setup sidebar toggle (mobile)
    setupSidebarToggle() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('win11Sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!toggleBtn || !sidebar) return;

        toggleBtn.setAttribute('aria-expanded', 'false');

        const openSidebar = () => {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('show');
            toggleBtn.setAttribute('aria-expanded', 'true');
            const firstLink = sidebar.querySelector('a, button');
            if (firstLink) firstLink.focus();
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
        };

        toggleBtn.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('open');
            if (isOpen) closeSidebar();
            else openSidebar();
        });

        sidebar.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });

        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }
    },

    // Setup collapsible sections
    setupCollapsibleSections() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.collapse || header.getAttribute('aria-controls');
                const content = document.getElementById(targetId);
                const arrow = header.querySelector('.collapse-arrow');

                if (content && arrow) {
                    content.classList.toggle('collapsed');
                    arrow.classList.toggle('collapsed');
                    const isCollapsed = content.classList.contains('collapsed');
                    header.setAttribute('aria-expanded', String(!isCollapsed));
                }
            });
        });
    },

    // Setup tabs
    setupTabs() {
        document.querySelectorAll('.win11-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                if (tabName === Win11State.currentTab && !Win11State.currentFolderId) return;

                Win11State.currentTab = tabName;

                // When switching tabs, go back to root
                if (tabName !== 'recent') {
                    Win11State.currentFolderId = null;
                }

                // Update active state
                document.querySelectorAll('.win11-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update breadcrumb
                const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
                if (breadcrumbCurrent) {
                    const labels = { recent: 'Recent', favorites: 'Favorites', all: 'All Entries' };
                    breadcrumbCurrent.textContent = labels[tabName] || 'All Entries';
                }

                // Animated tab content switch
                const fileList = document.getElementById('fileList');
                if (fileList) {
                    fileList.style.opacity = '0';
                    fileList.style.transform = 'translateY(10px)';
                    fileList.style.transition = 'opacity 150ms ease, transform 150ms ease';

                    setTimeout(() => {
                        this.loadFileList(Win11State.currentFolderId, tabName);
                        fileList.style.opacity = '1';
                        fileList.style.transform = 'translateY(0)';
                    }, 150);
                } else {
                    this.loadFileList(Win11State.currentFolderId, tabName);
                }
            });
        });
    },

    // Setup navigation buttons (back/forward/up)
    setupNavButtons() {
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const upBtn = document.getElementById('upBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (Win11State.historyIndex > 0) {
                    Win11State.historyIndex--;
                    const folderId = Win11State.history[Win11State.historyIndex];
                    Win11State.currentFolderId = folderId;
                    this.loadFileList(folderId, Win11State.currentTab);
                    this.updateNavButtons();
                    this.updateBreadcrumb(folderId);
                }
            });
        }

        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                if (Win11State.historyIndex < Win11State.history.length - 1) {
                    Win11State.historyIndex++;
                    const folderId = Win11State.history[Win11State.historyIndex];
                    Win11State.currentFolderId = folderId;
                    this.loadFileList(folderId, Win11State.currentTab);
                    this.updateNavButtons();
                    this.updateBreadcrumb(folderId);
                }
            });
        }

        if (upBtn) {
            upBtn.addEventListener('click', async () => {
                if (Win11State.currentFolderId) {
                    // Get parent from cached folder metadata or breadcrumb
                    const folder = Win11State.folderMap[Win11State.currentFolderId];
                    if (folder && folder.parentId) {
                        this.navigateToFolder(folder.parentId);
                    } else {
                        this.navigateToRoot();
                    }
                }
            });
        }
    },

    updateNavButtons() {
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const upBtn = document.getElementById('upBtn');

        if (backBtn) backBtn.disabled = Win11State.historyIndex <= 0;
        if (forwardBtn) forwardBtn.disabled = Win11State.historyIndex >= Win11State.history.length - 1;
        if (upBtn) upBtn.disabled = !Win11State.currentFolderId;
    },

    // Setup dropdown menus
    setupDropdowns() {
        const self = this;

        const setupDropdown = (buttonId, menuId, onSelect) => {
            const button = document.getElementById(buttonId);
            const menu = document.getElementById(menuId);
            if (!button || !menu) return;

            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            menu.setAttribute('role', 'menu');
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.setAttribute('role', 'menuitem');
                item.setAttribute('tabindex', '-1');
            });

            const openMenu = () => {
                menu.classList.add('show');
                button.setAttribute('aria-expanded', 'true');
                const firstItem = menu.querySelector('.dropdown-item');
                if (firstItem) firstItem.focus();
            };

            const closeMenu = () => {
                menu.classList.remove('show');
                button.setAttribute('aria-expanded', 'false');
                button.focus();
            };

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu.classList.contains('show');
                // Close other menus
                document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('[aria-haspopup="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
                if (!isOpen) openMenu();
            });

            button.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openMenu();
                }
            });

            menu.addEventListener('keydown', (e) => {
                const items = Array.from(menu.querySelectorAll('.dropdown-item'));
                const currentIndex = items.indexOf(document.activeElement);

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        items[(currentIndex + 1) % items.length].focus();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        items[(currentIndex - 1 + items.length) % items.length].focus();
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        if (document.activeElement.classList.contains('dropdown-item')) {
                            document.activeElement.click();
                        }
                        break;
                    case 'Escape':
                    case 'Tab':
                        e.preventDefault();
                        closeMenu();
                        break;
                }
            });

            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    menu.classList.remove('show');
                    button.setAttribute('aria-expanded', 'false');
                    onSelect(item);
                });
            });
        };

        // Sort dropdown
        setupDropdown('sortDropdown', 'sortMenu', (item) => {
            const sortVal = item.dataset.sort;
            const parts = sortVal.split('-');
            Win11State.sortOrder = parts.pop();
            Win11State.sortBy = parts.join('-');
            self.loadFileList(Win11State.currentFolderId, Win11State.currentTab);
        });

        // View dropdown
        setupDropdown('viewDropdown', 'viewMenu', (item) => {
            Win11State.viewMode = item.dataset.view;
            const detailsBtn = document.getElementById('detailsViewBtn');
            const tilesBtn = document.getElementById('tilesViewBtn');
            if (detailsBtn) detailsBtn.classList.toggle('active', Win11State.viewMode === 'details');
            if (tilesBtn) tilesBtn.classList.toggle('active', Win11State.viewMode === 'tiles');
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('[aria-haspopup="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
        });
    },

    // Setup view mode toggle buttons
    setupViewModeToggle() {
        const detailsBtn = document.getElementById('detailsViewBtn');
        const tilesBtn = document.getElementById('tilesViewBtn');

        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                Win11State.viewMode = 'details';
                detailsBtn.classList.add('active');
                tilesBtn?.classList.remove('active');
            });
        }

        if (tilesBtn) {
            tilesBtn.addEventListener('click', () => {
                Win11State.viewMode = 'tiles';
                tilesBtn.classList.add('active');
                detailsBtn?.classList.remove('active');
            });
        }
    },

    // Setup toolbar buttons
    setupToolbarButtons() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadFileList(Win11State.currentFolderId, Win11State.currentTab);
            });
        }

        // New Folder button
        const newFolderBtn = document.getElementById('newFolderBtn');
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', () => {
                this.promptCreateFolder();
            });
        }

        // AI Ask button — opens the AI panel
        const aiAskBtn = document.getElementById('aiAskBtn');
        if (aiAskBtn) {
            aiAskBtn.addEventListener('click', () => {
                AiPanel.open('Ask AI');
                // Stop loading spinner since we're just opening for input
                const loading = AiPanel.getModal().querySelector('#aiLoading');
                if (loading) loading.style.display = 'none';
            });
        }

        // AI Summarize button — summarizes current folder
        const aiSummarizeBtn = document.getElementById('aiSummarizeBtn');
        if (aiSummarizeBtn) {
            aiSummarizeBtn.addEventListener('click', () => {
                if (Win11State.currentFolderId) {
                    AiPanel.summarizeFolder(Win11State.currentFolderId);
                } else {
                    if (window.FileExplorer) FileExplorer.showToast('Navigate into a folder first', 'error');
                }
            });
        }
    },

    // Prompt to create a new folder
    async promptCreateFolder() {
        const name = prompt('Enter folder name:');
        if (!name || !name.trim()) return;

        try {
            const result = await ExplorerAPI.createFolder(name.trim(), Win11State.currentFolderId);
            if (result.success) {
                this.loadFileList(Win11State.currentFolderId, Win11State.currentTab);
                if (window.FileExplorer) window.FileExplorer.showToast('Folder created');
            } else {
                alert('Error creating folder: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error creating folder: ' + error.message);
        }
    },

    // Toggle item selection
    toggleSelect(entryId) {
        const item = document.querySelector(`.file-item[data-entry-id="${entryId}"]`);
        if (!item) return;

        const index = Win11State.selectedItems.indexOf(entryId);
        if (index > -1) {
            Win11State.selectedItems.splice(index, 1);
            item.classList.remove('selected');
        } else {
            Win11State.selectedItems.push(entryId);
            item.classList.add('selected');
        }

        // Update toolbar buttons
        const favoriteBtn = document.getElementById('favoriteBtn');
        const deleteBtn = document.getElementById('deleteToolbarBtn');
        const hasSelection = Win11State.selectedItems.length > 0;

        if (favoriteBtn) favoriteBtn.disabled = !hasSelection;
        if (deleteBtn) deleteBtn.disabled = !hasSelection;

        // Update status bar
        const selectedCount = document.getElementById('selectedCount');
        if (selectedCount) {
            selectedCount.textContent = hasSelection ? `| ${Win11State.selectedItems.length} selected` : '';
        }
    },

    // Initialize Windows 11 UI
    init() {
        this.setupSidebarToggle();
        this.setupCollapsibleSections();
        this.setupTabs();
        this.setupNavButtons();
        this.setupDropdowns();
        this.setupViewModeToggle();
        this.setupToolbarButtons();

        // Initial load
        this.loadFileList(null, 'recent');

        // Initialize FileExplorer if available
        if (window.FileExplorer) {
            window.FileExplorer.init();
        }
    }
};

// Make Win11 globally available
window.Win11 = Win11;

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Setup mobile menu on all pages
    setupMobileMenu();

    // Auth pages don't need protection
    if (path === '/login' || path === '/register') {
        return;
    }

    // All other pages require authentication
    if (!Auth.requireAuth()) {
        return;
    }

    // Setup logout button
    setupLogout();

    if (path === '/' || path === '/index.html') {
        // Index page - Windows 11 File Explorer UI
        if (document.querySelector('.win11-explorer')) {
            Win11.init();
            setupSearch();
            loadTagsForSidebar();
        } else {
            // Fallback to old UI
            loadEntries();
            loadTags();
            loadStats();
            setupCategoryFilter();
            setupSearch();
        }
    } else if (path === '/new' || path === '/new-entry.html') {
        setupCreateForm();
    } else if (path.startsWith('/entry/')) {
        setupEntryView();
    } else if (path.startsWith('/edit/')) {
        setupEditForm();
    }
});

// Load tags for Windows 11 sidebar
const loadTagsForSidebar = async () => {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;

    try {
        const result = await ExplorerAPI.getTags();
        if (result.success && result.data.length > 0) {
            tagsList.innerHTML = result.data.slice(0, 10).map(tag =>
                `<a href="#" class="sidebar-item" data-tag="${escapeHtml(tag)}">
                    <span class="item-icon">&#127991;</span>
                    <span class="item-text">${escapeHtml(tag)}</span>
                </a>`
            ).join('');

            tagsList.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tag = item.dataset.tag;
                    loadEntriesByTagWin11(tag);
                });
            });
        } else {
            tagsList.innerHTML = '<div class="sidebar-item" style="color: var(--win11-text-muted); font-style: italic;">No tags yet</div>';
        }
    } catch (error) {
        tagsList.innerHTML = '<div class="sidebar-item" style="color: var(--danger);">Error loading tags</div>';
    }
};

// Load entries by tag for Windows 11 UI
const loadEntriesByTagWin11 = async (tag) => {
    const fileList = document.getElementById('fileList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const itemCount = document.getElementById('itemCount');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');

    if (!fileList) return;

    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    fileList.innerHTML = '';

    try {
        const result = await fetchEntries({ tag });

        loadingState.style.display = 'none';

        if (result.success && result.data.length > 0) {
            fileList.innerHTML = result.data.map(renderFileItem).join('');
            itemCount.textContent = `${result.data.length} items`;
        } else {
            emptyState.style.display = 'flex';
            itemCount.textContent = '0 items';
        }

        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = `Tag: ${tag}`;
        }
    } catch (error) {
        loadingState.style.display = 'none';
        fileList.innerHTML = `<p class="error" style="padding: var(--space-lg);">Error: ${escapeHtml(error.message)}</p>`;
    }
};

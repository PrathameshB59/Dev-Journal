// Dev-Journal Frontend JavaScript

const API_BASE = '/api/entries';

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

const truncateText = (text, maxLength = 150) => {
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
    content = content.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

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

// API Functions (with authentication)
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

// Index Page Functions
const renderEntryCard = (entry) => {
    const tagsHtml = entry.tags && entry.tags.length > 0
        ? entry.tags.slice(0, 3).map(tag => `<span class="entry-tag">${tag}</span>`).join('')
        : '';

    return `
        <a href="/entry/${entry._id}" class="entry-card">
            <div class="entry-card-header">
                <span class="entry-category ${entry.category}">${getCategoryLabel(entry.category)}</span>
            </div>
            <h3>${entry.title}</h3>
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

// Search
const setupSearch = () => {
    const searchInput = getElement('searchInput');
    const searchBtn = getElement('searchBtn');

    if (!searchInput || !searchBtn) return;

    const performSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            loadEntries();
            return;
        }

        const entriesGrid = getElement('entriesGrid');
        const loadingIndicator = getElement('loadingIndicator');
        const noEntries = getElement('noEntries');
        const entryCount = getElement('entryCount');
        const contentTitle = getElement('contentTitle');

        loadingIndicator.style.display = 'block';
        noEntries.style.display = 'none';
        entriesGrid.innerHTML = '';

        try {
            const result = await searchEntries(query);

            loadingIndicator.style.display = 'none';

            if (result.success && result.data.length > 0) {
                entriesGrid.innerHTML = result.data.map(renderEntryCard).join('');
                entryCount.textContent = `${result.data.length} results`;
            } else {
                noEntries.style.display = 'block';
                entryCount.textContent = '0 results';
            }

            contentTitle.textContent = `Search: "${query}"`;
        } catch (error) {
            loadingIndicator.style.display = 'none';
            entriesGrid.innerHTML = `<p class="error">Error searching: ${error.message}</p>`;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
};

// Form Handling - Create Entry
const setupCreateForm = () => {
    const form = getElement('entryForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formMessage = getElement('formMessage');

        const data = {
            title: getElement('title').value.trim(),
            category: getElement('category').value,
            content: getElement('content').value.trim(),
            tags: getElement('tags').value.split(',').map(t => t.trim()).filter(t => t),
            codeLanguage: getElement('codeLanguage').value.trim(),
            codeBlock: getElement('codeBlock').value
        };

        try {
            const result = await createEntry(data);

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
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Error creating entry: ' + error.message;
            formMessage.style.display = 'block';
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
                getElement('title').value = entry.title;
                getElement('category').value = entry.category;
                getElement('content').value = entry.content;
                getElement('tags').value = entry.tags ? entry.tags.join(', ') : '';
                getElement('codeLanguage').value = entry.codeLanguage || '';
                getElement('codeBlock').value = entry.codeBlock || '';

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
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formMessage = getElement('formMessage');
        const id = getElement('entryId').value;

        const data = {
            title: getElement('title').value.trim(),
            category: getElement('category').value,
            content: getElement('content').value.trim(),
            tags: getElement('tags').value.split(',').map(t => t.trim()).filter(t => t),
            codeLanguage: getElement('codeLanguage').value.trim(),
            codeBlock: getElement('codeBlock').value
        };

        try {
            const result = await updateEntry(id, data);

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
            }
        } catch (error) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Error updating entry: ' + error.message;
            formMessage.style.display = 'block';
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

                // Update header
                getElement('entryTitle').innerHTML = `<span class="logo-icon">${getCategoryIcon(entry.category)}</span> ${entry.title}`;
                getElement('entryMeta').textContent = `${getCategoryLabel(entry.category)} - ${formatDate(entry.createdAt)}`;

                // Update content with auto-detected code blocks
                entryContent.innerHTML = `
                    <div class="content-body">
                        ${renderContent(entry.content)}
                    </div>
                `;

                // Update details
                getElement('entryDetails').innerHTML = `
                    <div class="detail-row">
                        <span class="detail-label">Category</span>
                        <span class="detail-value">${getCategoryLabel(entry.category)}</span>
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
                setupDeleteModal(entry._id);

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
const setupDeleteModal = (entryId) => {
    const deleteBtn = getElement('deleteBtn');
    const deleteModal = getElement('deleteModal');
    const cancelDelete = getElement('cancelDelete');
    const confirmDelete = getElement('confirmDelete');

    if (!deleteBtn || !deleteModal) return;

    deleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'flex';
    });

    cancelDelete.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    confirmDelete.addEventListener('click', async () => {
        try {
            const result = await deleteEntry(entryId);

            if (result.success) {
                window.location.href = '/';
            } else {
                alert('Error deleting entry: ' + (result.error || 'Unknown error'));
                deleteModal.style.display = 'none';
            }
        } catch (error) {
            alert('Error deleting entry: ' + error.message);
            deleteModal.style.display = 'none';
        }
    });

    // Close modal on outside click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
};

// Mobile Menu Toggle
const setupMobileMenu = () => {
    const mobileMenuBtn = getElement('mobileMenuBtn');
    const navActions = getElement('navActions');

    if (!mobileMenuBtn || !navActions) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navActions.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !navActions.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            navActions.classList.remove('open');
        }
    });

    // Close menu when window is resized above mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenuBtn.classList.remove('active');
            navActions.classList.remove('open');
        }
    });
};

// File Explorer: Tree Toggle
const setupTreeToggle = () => {
    const toggles = document.querySelectorAll('.tree-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.toggle('collapsed');
                toggle.classList.toggle('expanded');
                toggle.textContent = toggle.classList.contains('expanded') ? '\u25BC' : '\u25B6';
            }
        });
    });
};

// File Explorer: View Toggle (Grid/List)
let currentViewMode = 'grid';
const setupViewToggle = () => {
    const gridBtn = getElement('gridViewBtn');
    const listBtn = getElement('listViewBtn');
    const entriesGrid = getElement('entriesGrid');

    if (!gridBtn || !listBtn || !entriesGrid) return;

    gridBtn.addEventListener('click', () => {
        currentViewMode = 'grid';
        entriesGrid.classList.remove('list-view');
        entriesGrid.classList.add('grid-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    });

    listBtn.addEventListener('click', () => {
        currentViewMode = 'list';
        entriesGrid.classList.remove('grid-view');
        entriesGrid.classList.add('list-view');
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    });
};

// File Explorer: Breadcrumb Update
const updateBreadcrumb = (category) => {
    const breadcrumbCurrent = getElement('breadcrumbCurrent');
    if (!breadcrumbCurrent) return;

    if (category) {
        breadcrumbCurrent.textContent = getCategoryLabel(category);
    } else {
        breadcrumbCurrent.textContent = 'All Entries';
    }
};

// File Explorer: Update Category Counts
const updateCategoryCounts = (stats) => {
    if (!stats) return;

    stats.forEach(stat => {
        const countEl = document.getElementById(`count-${stat._id}`);
        if (countEl) {
            countEl.textContent = stat.count;
        }
    });
};

// File Explorer: Setup Tree Navigation
const setupTreeNavigation = () => {
    const fileTree = document.querySelector('.file-tree');
    if (!fileTree) return;

    fileTree.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('.tree-label');
        if (!link) return;

        // Update active state
        fileTree.querySelectorAll('.tree-label').forEach(a => a.classList.remove('active'));
        link.classList.add('active');

        // Load entries for category
        const category = link.dataset.category;
        loadEntries(category);
        updateBreadcrumb(category);
    });
};

// Render Entry Card (supports both grid and list view)
const renderEntryCardEnhanced = (entry) => {
    const tagsHtml = entry.tags && entry.tags.length > 0
        ? entry.tags.slice(0, 3).map(tag => `<span class="entry-tag">${tag}</span>`).join('')
        : '';

    // Calculate word count for list view
    const wordCount = entry.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200); // ~200 words per minute

    return `
        <a href="/entry/${entry._id}" class="entry-card">
            <div class="entry-card-header">
                <span class="entry-icon">${getCategoryIcon(entry.category)}</span>
                <span class="entry-category ${entry.category}">${getCategoryLabel(entry.category)}</span>
            </div>
            <h3>${entry.title}</h3>
            <p class="entry-preview">${truncateText(entry.content)}</p>
            <div class="entry-card-footer">
                <span class="entry-date">${formatDate(entry.createdAt)}</span>
                <span class="entry-meta">${wordCount} words · ${readTime} min read</span>
                <div class="entry-tags">${tagsHtml}</div>
            </div>
        </a>
    `;
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

// Windows 11 Explorer State
const Win11State = {
    currentTab: 'recent',
    currentCategory: '',
    sortBy: 'date',
    sortOrder: 'desc',
    viewMode: 'details',
    selectedItems: [],
    history: ['/'],
    historyIndex: 0
};

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

// Render Windows 11 style file item
const renderFileItem = (entry) => {
    const tagsHtml = entry.tags && entry.tags.length > 0
        ? entry.tags.slice(0, 2).map(tag => `<span class="entry-tag">${escapeHtml(tag)}</span>`).join('')
        : '<span style="color: var(--win11-text-muted);">-</span>';

    return `
        <a href="/entry/${entry._id}" class="file-item" data-entry-id="${entry._id}">
            <div class="file-name">
                <input type="checkbox" class="file-checkbox" onclick="event.stopPropagation(); Win11.toggleSelect('${entry._id}')">
                <span class="file-icon">${getCategoryIcon(entry.category)}</span>
                <span class="file-title">${escapeHtml(entry.title)}</span>
            </div>
            <span class="file-date">${formatRelativeDate(entry.updatedAt || entry.createdAt)}</span>
            <span class="file-category">
                <span class="category-badge ${entry.category}">
                    <span class="badge-dot"></span>
                    ${getCategoryLabel(entry.category)}
                </span>
            </span>
            <span class="file-tags">${tagsHtml}</span>
        </a>
    `;
};

// Windows 11 Explorer Module
const Win11 = {
    // Load entries for Windows 11 file list
    async loadFileList(category = '', tab = 'recent') {
        const fileList = document.getElementById('fileList');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const itemCount = document.getElementById('itemCount');

        if (!fileList) return;

        loadingState.style.display = 'flex';
        emptyState.style.display = 'none';
        fileList.innerHTML = '';

        try {
            const params = {};
            if (category) params.category = category;

            // Sort based on current settings
            params.sort = Win11State.sortBy;
            params.order = Win11State.sortOrder;

            const result = await fetchEntries(params);

            loadingState.style.display = 'none';

            if (result.success && result.data.length > 0) {
                let entries = result.data;

                // Filter by tab
                if (tab === 'favorites' && window.FileExplorer) {
                    const favIds = window.FileExplorer.favorites.map(f => f.id);
                    entries = entries.filter(e => favIds.includes(e._id));
                }

                fileList.innerHTML = entries.map(renderFileItem).join('');
                itemCount.textContent = `${entries.length} items`;

                // Update pinned folder counts
                this.updateFolderCounts(result.data);
            } else {
                emptyState.style.display = 'flex';
                itemCount.textContent = '0 items';
            }
        } catch (error) {
            loadingState.style.display = 'none';
            fileList.innerHTML = `<p class="error" style="padding: var(--space-lg);">Error loading entries: ${error.message}</p>`;
        }
    },

    // Update folder counts in pinned folders and sidebar
    updateFolderCounts(entries) {
        const counts = {
            'daily-learning': 0,
            'project-note': 0,
            'bug-fix': 0,
            'code-snippet': 0,
            'concept': 0
        };

        entries.forEach(entry => {
            if (counts[entry.category] !== undefined) {
                counts[entry.category]++;
            }
        });

        // Update sidebar counts
        Object.keys(counts).forEach(cat => {
            const countEl = document.getElementById(`count-${cat}`);
            if (countEl) countEl.textContent = counts[cat];

            const pinnedCount = document.getElementById(`pinned-${cat}`);
            if (pinnedCount) pinnedCount.textContent = `${counts[cat]} items`;
        });
    },

    // Setup sidebar toggle (mobile)
    setupSidebarToggle() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('win11Sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!toggleBtn || !sidebar) return;

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        });

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            });
        }
    },

    // Setup collapsible sections
    setupCollapsibleSections() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.collapse;
                const content = document.getElementById(targetId);
                const arrow = header.querySelector('.collapse-arrow');

                if (content && arrow) {
                    content.classList.toggle('collapsed');
                    arrow.classList.toggle('collapsed');
                }
            });
        });
    },

    // Setup tabs
    setupTabs() {
        document.querySelectorAll('.win11-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Don't do anything if clicking the same tab
                if (tabName === Win11State.currentTab) return;

                Win11State.currentTab = tabName;

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
                    // Fade out current content
                    fileList.style.opacity = '0';
                    fileList.style.transform = 'translateY(10px)';
                    fileList.style.transition = 'opacity 150ms ease, transform 150ms ease';

                    // After fade out, load new content and fade in
                    setTimeout(() => {
                        this.loadFileList(Win11State.currentCategory, tabName);
                        // Fade in happens automatically via CSS animation on new items
                        fileList.style.opacity = '1';
                        fileList.style.transform = 'translateY(0)';
                    }, 150);
                } else {
                    // Fallback: just reload
                    this.loadFileList(Win11State.currentCategory, tabName);
                }
            });
        });
    },

    // Setup category navigation
    setupCategoryNavigation() {
        // Sidebar items
        document.querySelectorAll('.sidebar-item[data-category]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.dataset.category;
                this.navigateToCategory(category);
            });
        });

        // Pinned folders
        document.querySelectorAll('.pinned-folder[data-category]').forEach(folder => {
            folder.addEventListener('click', (e) => {
                e.preventDefault();
                const category = folder.dataset.category;
                this.navigateToCategory(category);
            });
        });
    },

    // Navigate to category
    navigateToCategory(category) {
        Win11State.currentCategory = category;

        // Update active state in sidebar
        document.querySelectorAll('.sidebar-item[data-category]').forEach(item => {
            item.classList.toggle('active', item.dataset.category === category);
        });

        // Update breadcrumb
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = category ? getCategoryLabel(category) : 'All Entries';
        }

        // Add to history
        Win11State.history = Win11State.history.slice(0, Win11State.historyIndex + 1);
        Win11State.history.push(category || '/');
        Win11State.historyIndex = Win11State.history.length - 1;
        this.updateNavButtons();

        // Load entries
        this.loadFileList(category, Win11State.currentTab);
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
                    const category = Win11State.history[Win11State.historyIndex];
                    Win11State.currentCategory = category === '/' ? '' : category;
                    this.loadFileList(Win11State.currentCategory, Win11State.currentTab);
                    this.updateNavButtons();
                    this.updateBreadcrumbForCategory(Win11State.currentCategory);
                }
            });
        }

        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                if (Win11State.historyIndex < Win11State.history.length - 1) {
                    Win11State.historyIndex++;
                    const category = Win11State.history[Win11State.historyIndex];
                    Win11State.currentCategory = category === '/' ? '' : category;
                    this.loadFileList(Win11State.currentCategory, Win11State.currentTab);
                    this.updateNavButtons();
                    this.updateBreadcrumbForCategory(Win11State.currentCategory);
                }
            });
        }

        if (upBtn) {
            upBtn.addEventListener('click', () => {
                if (Win11State.currentCategory) {
                    this.navigateToCategory('');
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
        if (upBtn) upBtn.disabled = !Win11State.currentCategory;
    },

    updateBreadcrumbForCategory(category) {
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = category ? getCategoryLabel(category) : 'All Entries';
        }
    },

    // Setup dropdown menus
    setupDropdowns() {
        // Sort dropdown
        const sortDropdown = document.getElementById('sortDropdown');
        const sortMenu = document.getElementById('sortMenu');

        if (sortDropdown && sortMenu) {
            sortDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                sortMenu.classList.toggle('show');
                document.getElementById('viewMenu')?.classList.remove('show');
            });

            sortMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const [sortBy, sortOrder] = item.dataset.sort.split('-');
                    Win11State.sortBy = sortBy;
                    Win11State.sortOrder = sortOrder;

                    // Update active state
                    sortMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    sortMenu.classList.remove('show');

                    // Reload
                    this.loadFileList(Win11State.currentCategory, Win11State.currentTab);
                });
            });
        }

        // View dropdown
        const viewDropdown = document.getElementById('viewDropdown');
        const viewMenu = document.getElementById('viewMenu');

        if (viewDropdown && viewMenu) {
            viewDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                viewMenu.classList.toggle('show');
                document.getElementById('sortMenu')?.classList.remove('show');
            });

            viewMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    Win11State.viewMode = item.dataset.view;

                    // Update active state
                    viewMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    viewMenu.classList.remove('show');

                    // Update view mode buttons
                    const detailsBtn = document.getElementById('detailsViewBtn');
                    const tilesBtn = document.getElementById('tilesViewBtn');
                    if (detailsBtn) detailsBtn.classList.toggle('active', Win11State.viewMode === 'details');
                    if (tilesBtn) tilesBtn.classList.toggle('active', Win11State.viewMode === 'tiles');
                });
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            sortMenu?.classList.remove('show');
            viewMenu?.classList.remove('show');
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
                this.loadFileList(Win11State.currentCategory, Win11State.currentTab);
            });
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
        const deleteBtn = document.getElementById('deleteBtn');
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
        this.setupCategoryNavigation();
        this.setupNavButtons();
        this.setupDropdowns();
        this.setupViewModeToggle();
        this.setupToolbarButtons();

        // Initial load
        this.loadFileList();

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
            // Initialize Windows 11 UI
            Win11.init();
            setupSearch();

            // Load tags for sidebar
            loadTagsForSidebar();
        } else {
            // Fallback to old UI
            loadEntries();
            loadTags();
            loadStats();
            setupCategoryFilter();
            setupSearch();
            setupTreeToggle();
            setupViewToggle();
            setupTreeNavigation();

            // Load stats for category counts
            fetchStats().then(result => {
                if (result.success) {
                    updateCategoryCounts(result.data);
                }
            });
        }
    } else if (path === '/new' || path === '/new-entry.html') {
        // Create entry page
        setupCreateForm();
    } else if (path.startsWith('/entry/')) {
        // View entry page
        setupEntryView();
    } else if (path.startsWith('/edit/')) {
        // Edit entry page
        setupEditForm();
    }
});

// Load tags for Windows 11 sidebar
const loadTagsForSidebar = async () => {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;

    try {
        const result = await fetchTags();
        if (result.success && result.data.length > 0) {
            tagsList.innerHTML = result.data.slice(0, 10).map(tag =>
                `<a href="#" class="sidebar-item" data-tag="${escapeHtml(tag)}">
                    <span class="item-icon">&#127991;</span>
                    <span class="item-text">${escapeHtml(tag)}</span>
                </a>`
            ).join('');

            // Add click handlers
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
        fileList.innerHTML = `<p class="error" style="padding: var(--space-lg);">Error: ${error.message}</p>`;
    }
};

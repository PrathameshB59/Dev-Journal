// Admin Panel Module for Dev-Journal
const Admin = {
    chart: null,
    currentPage: 1,
    usersPerPage: 20,

    async init() {
        // Check authentication
        if (!Auth.requireAuth()) return;

        // Check if user is admin
        const user = Auth.getUser();
        if (!user || user.role !== 'admin') {
            this.showAccessDenied();
            return;
        }

        // Show admin content
        this.showAdminContent();

        // Setup UI
        this.setupUserDisplay();
        this.setupLogout();
        this.setupMobileMenu();
        this.setupRefreshButton();
        this.setupCouponForm();

        // Load data
        await this.loadStats();
    },

    showAccessDenied() {
        const accessDenied = document.getElementById('accessDenied');
        const adminContent = document.getElementById('adminContent');
        if (accessDenied) accessDenied.style.display = 'block';
        if (adminContent) adminContent.style.display = 'none';
    },

    showAdminContent() {
        const accessDenied = document.getElementById('accessDenied');
        const adminContent = document.getElementById('adminContent');
        if (accessDenied) accessDenied.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
    },

    setupUserDisplay() {
        const user = Auth.getUser();
        const userDisplay = document.getElementById('userDisplay');
        if (user && userDisplay) {
            userDisplay.textContent = user.name || user.email;
        }
    },

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
    },

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navContent = document.getElementById('navPanel') || document.querySelector('.nav-content');

        if (menuBtn && navContent) {
            if (menuBtn.dataset.mobileBound === 'true') return;
            menuBtn.dataset.mobileBound = 'true';

            menuBtn.setAttribute('aria-expanded', 'false');

            const closeMenu = () => {
                navContent.classList.remove('open');
                menuBtn.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            };

            menuBtn.addEventListener('click', () => {
                const isOpen = navContent.classList.toggle('open');
                menuBtn.classList.toggle('active', isOpen);
                menuBtn.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', (e) => {
                if (!menuBtn.contains(e.target) && !navContent.contains(e.target)) {
                    closeMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navContent.classList.contains('open')) {
                    closeMenu();
                    menuBtn.focus();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) closeMenu();
            });
        }
    },

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadStats());
        }
    },

    async loadStats() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: Auth.getAuthHeader()
            });

            if (response.status === 403) {
                this.showAccessDenied();
                return;
            }

            const result = await response.json();

            if (result.success) {
                this.renderStats(result.data);
            }
        } catch (error) {
            console.error('Failed to load admin stats:', error);
            this.showToast('Failed to load stats', 'error');
        }
    },

    renderStats(data) {
        const { overview, usersByRole, entriesByCategory, entriesPerDay, recentUsers, recentEntries } = data;

        // Update stat cards
        document.getElementById('totalUsers').textContent = overview.totalUsers;
        document.getElementById('activeUsers').textContent = overview.activeUsers;
        document.getElementById('totalEntries').textContent = overview.totalEntries;
        document.getElementById('adminCount').textContent = usersByRole.admin || 0;

        // Render role breakdown
        this.renderRoleBreakdown(usersByRole);

        // Render category breakdown
        this.renderCategoryBreakdown(entriesByCategory);

        // Render activity chart
        this.renderActivityChart(entriesPerDay);

        // Render recent users
        this.renderRecentUsers(recentUsers);

        // Render recent entries
        this.renderRecentEntries(recentEntries);

        // Load coupons
        this.loadCoupons();
    },

    renderRoleBreakdown(roles) {
        const container = document.getElementById('roleBreakdown');
        if (!container) return;

        const roleIcons = {
            admin: '&#128081;',
            moderator: '&#128110;',
            user: '&#128100;'
        };

        const roleOrder = ['admin', 'moderator', 'user'];

        container.innerHTML = roleOrder
            .filter(role => roles[role] !== undefined)
            .map(role => `
                <div class="breakdown-item">
                    <span class="item-name">
                        <span>${roleIcons[role]}</span>
                        <span style="text-transform: capitalize;">${role}s</span>
                    </span>
                    <span class="item-count">${roles[role]}</span>
                </div>
            `).join('');
    },

    renderCategoryBreakdown(categories) {
        const container = document.getElementById('categoryBreakdown');
        if (!container) return;

        const categoryIcons = {
            'daily-learning': '&#128218;',
            'project-note': '&#128193;',
            'bug-fix': '&#128027;',
            'code-snippet': '&#128187;',
            'concept': '&#128161;'
        };

        const categoryNames = {
            'daily-learning': 'Daily Learning',
            'project-note': 'Project Notes',
            'bug-fix': 'Bug Fixes',
            'code-snippet': 'Code Snippets',
            'concept': 'Concepts'
        };

        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]);

        container.innerHTML = sortedCategories.map(([category, count]) => `
            <div class="breakdown-item">
                <span class="item-name">
                    <span>${categoryIcons[category] || '&#128196;'}</span>
                    ${categoryNames[category] || category}
                </span>
                <span class="item-count">${count}</span>
            </div>
        `).join('');
    },

    renderActivityChart(activityData) {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;

        // Generate last 7 days
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

            const dayData = activityData.find(d => d._id === dateStr);
            data.push(dayData ? dayData.count : 0);
        }

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Entries Created',
                    data,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderRecentUsers(users) {
        const tbody = document.getElementById('recentUsersTable');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => {
            const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const statusClass = user.isActive ? 'active' : 'inactive';
            const statusText = user.isActive ? 'Active' : 'Inactive';

            return `
                <tr>
                    <td>${user.name || '-'}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge ${user.role}">${user.role}</span></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${joinDate}</td>
                </tr>
            `;
        }).join('');
    },

    renderRecentEntries(entries) {
        const tbody = document.getElementById('recentEntriesTable');
        if (!tbody) return;

        const categoryNames = {
            'daily-learning': 'Daily Learning',
            'project-note': 'Project Note',
            'bug-fix': 'Bug Fix',
            'code-snippet': 'Code Snippet',
            'concept': 'Concept'
        };

        tbody.innerHTML = entries.map(entry => {
            const createdDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const author = entry.userId ? (entry.userId.name || entry.userId.email) : 'Unknown';

            return `
                <tr>
                    <td><a href="/entry/${entry._id}" style="color: var(--primary);">${entry.title}</a></td>
                    <td>${author}</td>
                    <td>${categoryNames[entry.category] || entry.category}</td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="user-action-btn danger" onclick="Admin.confirmDeleteEntry('${entry._id}')" title="Delete Entry">&#128465;</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Coupon management
    async loadCoupons() {
        try {
            const response = await fetch('/api/admin/coupons', {
                headers: Auth.getAuthHeader()
            });
            const result = await response.json();
            if (result.success) {
                this.renderCoupons(result.data);
            }
        } catch (error) {
            console.error('Failed to load coupons:', error);
        }
    },

    renderCoupons(coupons) {
        const tbody = document.getElementById('couponsTable');
        if (!tbody) return;

        if (!coupons.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-muted); text-align:center; padding:var(--space-lg)">No coupons created yet</td></tr>';
            return;
        }

        tbody.innerHTML = coupons.map(c => {
            const created = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const isFull = c.usedCount >= c.maxUses;
            const statusClass = !c.isActive ? 'inactive' : (isExpired || isFull) ? 'locked' : 'active';
            const statusText = !c.isActive ? 'Disabled' : isExpired ? 'Expired' : isFull ? 'Used Up' : 'Active';

            return `
                <tr>
                    <td><strong style="letter-spacing:1px">${c.code}</strong></td>
                    <td>${c.durationDays} days</td>
                    <td>${c.usedCount} / ${c.maxUses}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${created}</td>
                    <td>
                        ${c.isActive ? `<button class="user-action-btn danger" onclick="Admin.deleteCoupon('${c._id}')" title="Disable">&#128465;</button>` : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    },

    async createCoupon(code, durationDays, maxUses) {
        try {
            const response = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...Auth.getAuthHeader()
                },
                body: JSON.stringify({ code, durationDays, maxUses })
            });
            const result = await response.json();
            if (result.success) {
                this.showToast('Coupon created successfully', 'success');
                this.loadCoupons();
            } else {
                this.showToast(result.error || 'Failed to create coupon', 'error');
            }
        } catch (error) {
            this.showToast('Failed to create coupon', 'error');
        }
    },

    async deleteCoupon(couponId) {
        try {
            const response = await fetch(`/api/admin/coupons/${couponId}`, {
                method: 'DELETE',
                headers: Auth.getAuthHeader()
            });
            const result = await response.json();
            if (result.success) {
                this.showToast('Coupon deactivated', 'success');
                this.loadCoupons();
            } else {
                this.showToast(result.error || 'Failed to deactivate coupon', 'error');
            }
        } catch (error) {
            this.showToast('Failed to deactivate coupon', 'error');
        }
    },

    setupCouponForm() {
        const form = document.getElementById('createCouponForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const code = document.getElementById('couponCode').value.trim();
                const days = parseInt(document.getElementById('couponDays').value) || 30;
                const maxUses = parseInt(document.getElementById('couponMaxUses').value) || 100;
                if (!code) {
                    this.showToast('Coupon code is required', 'error');
                    return;
                }
                this.createCoupon(code, days, maxUses);
                document.getElementById('couponCode').value = '';
            });
        }
    },

    // Entry management
    async deleteEntry(entryId) {
        try {
            const response = await fetch(`/api/admin/entries/${entryId}`, {
                method: 'DELETE',
                headers: Auth.getAuthHeader()
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Entry deleted successfully', 'success');
                this.loadStats(); // Reload stats to refresh recent entries
            } else {
                this.showToast(result.error || 'Failed to delete entry', 'error');
            }
        } catch (error) {
            console.error('Delete entry error:', error);
            this.showToast(`Failed to delete entry: ${error.message}`, 'error');
        }
    },

    confirmDeleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            this.deleteEntry(entryId);
        }
    },

    // Toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// Admin Users Page Module
const AdminUsers = {
    currentPage: 1,
    usersPerPage: 20,
    currentFilters: {},

    async init() {
        // Check authentication
        if (!Auth.requireAuth()) return;

        // Check if user is admin
        const user = Auth.getUser();
        if (!user || user.role !== 'admin') {
            Admin.showAccessDenied();
            return;
        }

        // Show admin content
        Admin.showAdminContent();

        // Setup UI
        Admin.setupUserDisplay();
        Admin.setupLogout();
        Admin.setupMobileMenu();
        this.setupFilters();

        // Load users
        await this.loadUsers();
    },

    setupFilters() {
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchInput');

        if (roleFilter) {
            roleFilter.addEventListener('change', () => {
                this.currentFilters.role = roleFilter.value;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.isActive = statusFilter.value;
                this.currentPage = 1;
                this.loadUsers();
            });
        }

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = searchInput.value;
                    this.currentPage = 1;
                    this.loadUsers();
                }, 300);
            });
        }
    },

    async loadUsers() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.usersPerPage,
                ...this.currentFilters
            });

            // Remove empty params
            for (const [key, value] of params.entries()) {
                if (!value) params.delete(key);
            }

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: Auth.getAuthHeader()
            });

            const result = await response.json();

            if (result.success) {
                this.renderUsers(result.data.users);
                this.renderPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            Admin.showToast('Failed to load users', 'error');
        }
    },

    renderUsers(users) {
        const tbody = document.getElementById('usersTable');
        if (!tbody) return;

        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => {
            const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const lastLogin = user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Never';

            const statusClass = user.isActive ? 'active' : 'inactive';
            const statusText = user.isActive ? 'Active' : 'Inactive';

            const isLocked = user.lockUntil && new Date(user.lockUntil) > new Date();

            return `
                <tr data-user-id="${user._id}">
                    <td>${user.name || '-'}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge ${user.role}">${user.role}</span></td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        ${isLocked ? '<span class="status-badge locked">Locked</span>' : ''}
                    </td>
                    <td>${user.entryCount || 0}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <div class="user-actions">
                            <button class="user-action-btn" onclick="AdminUsers.editUser('${user._id}')" title="Edit">&#9998;</button>
                            ${isLocked ? `<button class="user-action-btn" onclick="AdminUsers.unlockUser('${user._id}')" title="Unlock">&#128275;</button>` : ''}
                            <button class="user-action-btn danger" onclick="AdminUsers.confirmDelete('${user._id}')" title="Delete">&#128465;</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container) return;

        container.innerHTML = `
            <button class="pagination-btn" onclick="AdminUsers.goToPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>&#8592; Prev</button>
            <span class="pagination-info">Page ${pagination.page} of ${pagination.pages}</span>
            <button class="pagination-btn" onclick="AdminUsers.goToPage(${pagination.page + 1})" ${pagination.page >= pagination.pages ? 'disabled' : ''}>Next &#8594;</button>
        `;
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadUsers();
    },

    async editUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: Auth.getAuthHeader()
            });
            const result = await response.json();

            if (result.success) {
                this.showEditModal(result.data);
            }
        } catch (error) {
            Admin.showToast('Failed to load user', 'error');
        }
    },

    showEditModal(user) {
        const currentUser = Auth.getUser();
        const isSelf = currentUser && currentUser.id === user._id;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <h3>Edit User</h3>
                <form id="editUserForm">
                    <div class="form-group">
                        <label for="editName">Name</label>
                        <input type="text" id="editName" value="${user.name || ''}" placeholder="User name">
                    </div>
                    <div class="form-group">
                        <label for="editRole">Role</label>
                        <select id="editRole" ${isSelf ? 'disabled' : ''}>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        ${isSelf ? '<small style="color: var(--text-muted);">Cannot change your own role</small>' : ''}
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status</label>
                        <select id="editStatus" ${isSelf ? 'disabled' : ''}>
                            <option value="true" ${user.isActive ? 'selected' : ''}>Active</option>
                            <option value="false" ${!user.isActive ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submit
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveUser(user._id, {
                name: document.getElementById('editName').value,
                role: document.getElementById('editRole').value,
                isActive: document.getElementById('editStatus').value === 'true'
            });
            modal.remove();
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    async saveUser(userId, data) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...Auth.getAuthHeader()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                Admin.showToast('User updated successfully', 'success');
                this.loadUsers();
            } else {
                Admin.showToast(result.error || 'Failed to update user', 'error');
            }
        } catch (error) {
            Admin.showToast('Failed to update user', 'error');
        }
    },

    async unlockUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/unlock`, {
                method: 'POST',
                headers: Auth.getAuthHeader()
            });

            const result = await response.json();

            if (result.success) {
                Admin.showToast('User account unlocked', 'success');
                this.loadUsers();
            } else {
                Admin.showToast(result.error || 'Failed to unlock user', 'error');
            }
        } catch (error) {
            Admin.showToast('Failed to unlock user', 'error');
        }
    },

    confirmDelete(userId) {
        const currentUser = Auth.getUser();
        if (currentUser && currentUser.id === userId) {
            Admin.showToast('Cannot delete your own account', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <h3>&#9888; Confirm Delete</h3>
                <p>Are you sure you want to delete this user? This will also delete all their entries. This action cannot be undone.</p>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-danger" onclick="AdminUsers.deleteUser('${userId}'); this.closest('.modal-overlay').remove();">Delete User</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    async deleteUser(userId) {
        try {
            console.log('[DELETE USER] Starting deletion for:', userId);

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: Auth.getAuthHeader()
            });

            console.log('[DELETE USER] Response status:', response.status);

            const result = await response.json();
            console.log('[DELETE USER] Response data:', result);

            if (result.success) {
                Admin.showToast('User and their data deleted successfully', 'success');
                await this.loadUsers(); // Reload user list
            } else {
                console.error('[DELETE USER] Server error:', result.error);
                Admin.showToast(result.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('[DELETE USER] Request failed:', {
                userId,
                error: error.message,
                stack: error.stack
            });
            Admin.showToast(`Failed to delete user: ${error.message}`, 'error');
        }
    }
};

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on
    if (document.getElementById('usersTable')) {
        AdminUsers.init();
    } else {
        Admin.init();
    }
});

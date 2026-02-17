// Settings Page Logic
(function () {
    'use strict';

    // Auth check
    if (window.Auth && !Auth.requireAuth()) return;

    const API_BASE = '/api/settings';

    function getAuthHeader() {
        const token = localStorage.getItem('devjournal_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async function apiCall(url, options = {}) {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
                ...options.headers
            }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Request failed');
        return data;
    }

    function setupMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn') || document.querySelector('.mobile-menu-btn');
        const navPanel = document.getElementById('navPanel') || document.querySelector('.nav-content');
        if (!menuBtn || !navPanel) return;
        if (menuBtn.dataset.mobileBound === 'true') return;
        menuBtn.dataset.mobileBound = 'true';

        menuBtn.setAttribute('aria-expanded', 'false');

        const closeMenu = () => {
            navPanel.classList.remove('open');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        };

        menuBtn.addEventListener('click', () => {
            const isOpen = navPanel.classList.toggle('open');
            menuBtn.classList.toggle('active', isOpen);
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navPanel.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navPanel.classList.contains('open')) {
                closeMenu();
                menuBtn.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    // Tab switching
    const tabs = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-panel');

    function switchTab(tabName) {
        tabs.forEach(t => {
            const isActive = t.dataset.tab === tabName;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive);
        });
        panels.forEach(p => {
            p.classList.toggle('active', p.id === `panel-${tabName}`);
        });
        window.location.hash = tabName;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Initialize from hash
    const initialTab = window.location.hash.slice(1) || 'profile';
    if (['profile', 'ai', 'security'].includes(initialTab)) {
        switchTab(initialTab);
    }

    // Alert helper
    function showAlert(id, message, type) {
        const el = document.getElementById(id);
        el.textContent = message;
        el.className = `alert show alert-${type}`;
        setTimeout(() => { el.classList.remove('show'); }, 5000);
    }

    // Load settings
    async function loadSettings() {
        try {
            const { data } = await apiCall(API_BASE);

            // Profile tab
            document.getElementById('userEmail').textContent = data.email;
            const roleEl = document.getElementById('userRole');
            roleEl.textContent = data.role;
            if (data.role === 'admin') roleEl.classList.add('admin');
            document.getElementById('userSince').textContent = new Date(data.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            document.getElementById('nameInput').value = data.name || '';

            // AI tab
            renderAiStatus(data);
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    }

    function renderAiStatus(data) {
        const isActive = data.aiEnabled && data.aiPlan !== 'NONE';
        const isExpired = data.aiExpiresAt && new Date(data.aiExpiresAt) < new Date();
        const effectiveActive = isActive && !isExpired;

        // Status card
        const badge = document.getElementById('aiBadge');
        const statusText = document.getElementById('aiStatusText');

        if (effectiveActive) {
            badge.textContent = 'Active';
            badge.className = 'badge badge-success';
            const expDate = new Date(data.aiExpiresAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            statusText.textContent = `AI features are enabled. Your access expires on ${expDate}.`;
        } else if (isActive && isExpired) {
            badge.textContent = 'Expired';
            badge.className = 'badge badge-warning';
            statusText.textContent = 'Your AI subscription has expired. Redeem a new coupon to reactivate.';
        } else {
            badge.textContent = 'Inactive';
            badge.className = 'badge badge-danger';
            statusText.textContent = 'AI features are not enabled. Redeem a coupon code below to activate.';
        }

        // Details
        document.getElementById('aiPlanStatus').textContent = effectiveActive ? 'Active' : 'Inactive';
        document.getElementById('aiPlanType').textContent = data.aiPlan || 'NONE';

        if (data.aiExpiresAt) {
            document.getElementById('aiExpiryRow').style.display = '';
            document.getElementById('aiExpiry').textContent = new Date(data.aiExpiresAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        if (data.couponUsed) {
            document.getElementById('aiCouponRow').style.display = '';
            document.getElementById('aiCouponCode').textContent = data.couponUsed;
        }

        // Hide coupon form if active
        if (effectiveActive) {
            document.getElementById('couponSection').style.display = 'none';
        }
    }

    // Profile form
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();
        if (!name) return showAlert('profileAlert', 'Name is required', 'error');

        try {
            await apiCall(`${API_BASE}/profile`, {
                method: 'PUT',
                body: JSON.stringify({ name })
            });
            showAlert('profileAlert', 'Profile updated successfully', 'success');
            // Update nav display
            const userDisplay = document.getElementById('userDisplay');
            if (userDisplay) userDisplay.textContent = name;
            // Update localStorage
            const stored = JSON.parse(localStorage.getItem('devjournal_user') || '{}');
            stored.name = name;
            localStorage.setItem('devjournal_user', JSON.stringify(stored));
        } catch (err) {
            showAlert('profileAlert', err.message, 'error');
        }
    });

    // Coupon form
    document.getElementById('couponForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('couponInput').value.trim();
        if (!code) return showAlert('aiAlert', 'Please enter a coupon code', 'error');

        const btn = document.getElementById('redeemBtn');
        btn.disabled = true;
        btn.textContent = 'Redeeming...';

        try {
            const result = await apiCall(`${API_BASE}/redeem-coupon`, {
                method: 'POST',
                body: JSON.stringify({ code })
            });
            showAlert('aiAlert', result.message || 'Coupon redeemed successfully!', 'success');
            document.getElementById('couponInput').value = '';
            // Reload AI status
            renderAiStatus(result.data);
            document.getElementById('couponSection').style.display = 'none';
        } catch (err) {
            showAlert('aiAlert', err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Redeem';
        }
    });

    // Password form
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            return showAlert('securityAlert', 'New passwords do not match', 'error');
        }

        if (newPassword.length < 8) {
            return showAlert('securityAlert', 'Password must be at least 8 characters', 'error');
        }

        try {
            await apiCall(`${API_BASE}/password`, {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            showAlert('securityAlert', 'Password changed successfully', 'success');
            document.getElementById('passwordForm').reset();
        } catch (err) {
            showAlert('securityAlert', err.message, 'error');
        }
    });

    // User display in nav
    const user = JSON.parse(localStorage.getItem('devjournal_user') || '{}');
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay && user.name) userDisplay.textContent = user.name;

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') {
                logout();
            } else {
                localStorage.removeItem('devjournal_token');
                localStorage.removeItem('devjournal_user');
                window.location.href = '/login';
            }
        });
    }

    setupMobileMenu();

    // Load data
    loadSettings();
})();

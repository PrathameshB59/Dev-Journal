// Auth Module for Dev-Journal
const Auth = {
    TOKEN_KEY: 'devjournal_token',
    USER_KEY: 'devjournal_user',

    // Store authentication data
    setAuth(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    // Get stored token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    // Get stored user
    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired (basic JWT decode)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },

    // Clear authentication data
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = '/login';
    },

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    // Require authentication - redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    },

    // Redirect if already authenticated (for login/register pages)
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = '/';
            return true;
        }
        return false;
    }
};

// API functions with authentication
const AuthAPI = {
    async register(email, password, name) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        return response.json();
    },

    async login(email, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    async getMe() {
        const response = await fetch('/api/auth/me', {
            headers: Auth.getAuthHeader()
        });
        return response.json();
    }
};

// Export for use in other scripts
window.Auth = Auth;
window.AuthAPI = AuthAPI;

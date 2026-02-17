const express = require('express');
const cors = require('cors');
const path = require('path');

// Import security middleware
const {
    securityHeaders,
    apiLimiter,
    authLimiter,
    registerLimiter
} = require('./middleware/security');

const app = express();

// EJS template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../frontend/views'));

// Security middleware (apply first)
app.use(securityHeaders);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files from frontend
app.use('/css', express.static(path.join(__dirname, '../../frontend/public/css')));
app.use('/js', express.static(path.join(__dirname, '../../frontend/public/js')));
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const entriesRouter = require('./routes/entries');
const explorerRouter = require('./routes/explorer');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const statsRouter = require('./routes/stats');
const aiRouter = require('./routes/ai');
const settingsRouter = require('./routes/settings');

// Apply rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);

// Apply general API rate limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api/entries', entriesRouter);
app.use('/api/explorer', explorerRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/settings', settingsRouter);

// Serve EJS pages
app.get('/', (req, res) => {
    res.render('index', { title: 'Home', currentPage: 'home' });
});

app.get('/new', (req, res) => {
    res.render('new-entry', { title: 'New Entry', currentPage: 'new' });
});

app.get('/entry/:id', (req, res) => {
    res.render('entry', { title: 'View Entry', currentPage: 'entry' });
});

app.get('/edit/:id', (req, res) => {
    res.render('edit-entry', { title: 'Edit Entry', currentPage: 'edit' });
});

app.get('/explain/:id', (req, res) => {
    res.render('explain', { title: 'AI Explanation', currentPage: 'explain' });
});

// Auth pages
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', currentPage: 'login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', currentPage: 'register' });
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard', currentPage: 'dashboard' });
});

// Settings page
app.get('/settings', (req, res) => {
    res.render('settings', { title: 'Settings', currentPage: 'settings' });
});

// Admin pages
app.get('/admin', (req, res) => {
    res.render('admin/index', { title: 'Admin Dashboard', currentPage: 'admin' });
});

app.get('/admin/users', (req, res) => {
    res.render('admin/users', { title: 'User Management', currentPage: 'admin-users' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

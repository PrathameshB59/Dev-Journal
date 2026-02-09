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

// Security middleware (apply first)
app.use(securityHeaders);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use('/css', express.static(path.join(__dirname, '../../frontend/public/css')));
app.use('/js', express.static(path.join(__dirname, '../../frontend/public/js')));
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));

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

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/index.html'));
});

app.get('/new', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/new-entry.html'));
});

app.get('/entry/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/entry.html'));
});

app.get('/edit/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/edit-entry.html'));
});

app.get('/explain/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/explain.html'));
});

// Auth pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/register.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/dashboard.html'));
});

// Settings page
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/settings.html'));
});

// Admin pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/admin/index.html'));
});

app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/admin/users.html'));
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

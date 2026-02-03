const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use('/css', express.static(path.join(__dirname, '../../frontend/public/css')));
app.use('/js', express.static(path.join(__dirname, '../../frontend/public/js')));
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')));

// API Routes
const entriesRouter = require('./routes/entries');
app.use('/api/entries', entriesRouter);

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

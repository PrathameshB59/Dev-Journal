const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');

// GET /api/entries - Get all entries (with optional filters)
router.get('/', entryController.getAllEntries);

// GET /api/entries/search - Search entries
router.get('/search', entryController.searchEntries);

// GET /api/entries/tags - Get all unique tags
router.get('/tags', entryController.getAllTags);

// GET /api/entries/stats - Get category statistics
router.get('/stats', entryController.getCategoryStats);

// GET /api/entries/:id - Get single entry
router.get('/:id', entryController.getEntry);

// POST /api/entries - Create new entry
router.post('/', entryController.createEntry);

// PUT /api/entries/:id - Update entry
router.put('/:id', entryController.updateEntry);

// DELETE /api/entries/:id - Delete entry
router.delete('/:id', entryController.deleteEntry);

module.exports = router;

const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { protect } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// GET /api/entries - Get all entries (with optional filters)
router.get('/', entryController.getAllEntries);

// GET /api/entries/search - Search entries
router.get('/search', entryController.searchEntries);

// GET /api/entries/tags - Get all unique tags
router.get('/tags', entryController.getAllTags);

// GET /api/entries/stats - Get category statistics
router.get('/stats', entryController.getCategoryStats);

// GET /api/entries/:id/versions - Get entry version list
router.get('/:id/versions', entryController.getEntryVersions);

// GET /api/entries/:id/versions/:version - Get single version snapshot
router.get('/:id/versions/:version', entryController.getEntryVersion);

// POST /api/entries/:id/versions/:version/restore - Restore a snapshot
router.post('/:id/versions/:version/restore', entryController.restoreEntryVersion);

// GET /api/entries/:id - Get single entry
router.get('/:id', entryController.getEntry);

// POST /api/entries - Create new entry
router.post('/', entryController.createEntry);

// PUT /api/entries/:id - Update entry
router.put('/:id', entryController.updateEntry);

// DELETE /api/entries/:id - Delete entry
router.delete('/:id', entryController.deleteEntry);

module.exports = router;

const express = require('express');
const router = express.Router();
const explorer = require('../controllers/explorerController');
const { protect } = require('../middleware/auth');

// All explorer routes require authentication
router.use(protect);

// Filesystem navigation
router.get('/root', explorer.getRoot);
router.get('/folder/:id', explorer.getFolder);
router.get('/breadcrumb/:id', explorer.getBreadcrumb);

// CRUD
router.post('/file', explorer.createFile);
router.post('/folder', explorer.createFolder);
router.patch('/:id', explorer.updateEntry);
router.delete('/:id', explorer.deleteEntry);
router.patch('/:id/move', explorer.moveEntry);

// Search & discovery
router.get('/search', explorer.searchEntries);
router.get('/favorites', explorer.getFavorites);
router.get('/recent', explorer.getRecent);
router.get('/tags', explorer.getAllTags);

module.exports = router;

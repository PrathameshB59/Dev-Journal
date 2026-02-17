const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const explorer = require('../controllers/explorerController');
const entryController = require('../controllers/entryController');
const { protect } = require('../middleware/auth');

// All explorer routes require authentication
router.use(protect);

const uploadRoot = path.join(__dirname, '../../uploads/media');
fs.mkdirSync(uploadRoot, { recursive: true });

const ALLOWED_MEDIA_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'video/mp4',
    'video/webm',
    'video/ogg'
]);

const MEDIA_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const MIME_EXTENSION = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/mp4': '.m4a',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv'
};

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadRoot),
    filename: (req, file, cb) => {
        const originalExt = path.extname(file.originalname || '').toLowerCase();
        const ext = originalExt || MIME_EXTENSION[file.mimetype] || '';
        const baseName = path.basename(file.originalname || 'media', originalExt)
            .replace(/[^a-z0-9-_]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 64) || 'media';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`);
    }
});

const mediaUploader = multer({
    storage: mediaStorage,
    limits: { fileSize: MEDIA_MAX_UPLOAD_BYTES },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MEDIA_MIME.has(file.mimetype)) {
            cb(new Error('Only image/audio/video uploads are allowed'));
            return;
        }
        cb(null, true);
    }
});

const uploadMedia = (req, res, next) => {
    mediaUploader.single('media')(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ success: false, error: 'Media upload exceeds 50MB max size' });
            return;
        }

        res.status(400).json({ success: false, error: error.message || 'Invalid media upload' });
    });
};

// Filesystem navigation
router.get('/root', explorer.getRoot);
router.get('/folder/:id', explorer.getFolder);
router.get('/breadcrumb/:id', explorer.getBreadcrumb);

// CRUD
router.post('/file', explorer.createFile);
router.post('/media', uploadMedia, explorer.createMediaEntry);
router.post('/folder', explorer.createFolder);
router.get('/:id/versions', entryController.getEntryVersions);
router.get('/:id/versions/:version', entryController.getEntryVersion);
router.post('/:id/versions/:version/restore', entryController.restoreEntryVersion);
router.patch('/:id', explorer.updateEntry);
router.delete('/:id', explorer.deleteEntry);
router.patch('/:id/move', explorer.moveEntry);

// Search & discovery
router.get('/search', explorer.searchEntries);
router.get('/favorites', explorer.getFavorites);
router.get('/recent', explorer.getRecent);
router.get('/tags', explorer.getAllTags);

module.exports = router;

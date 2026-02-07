const express = require('express');
const router = express.Router();
const ai = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// Status endpoint (no AI access check needed)
router.get('/status', ai.getStatus);

// AI action routes (require AI access)
router.post('/summarize', ai.checkAiAccess, ai.summarize);
router.post('/explain', ai.checkAiAccess, ai.explain);
router.post('/quick-help', ai.checkAiAccess, ai.quickHelp);

module.exports = router;

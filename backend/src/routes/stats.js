const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const statsController = require('../controllers/statsController');

// All routes require authentication
router.use(protect);

// Dashboard stats
router.get('/dashboard', statsController.getDashboardStats);

// Activity heatmap
router.get('/heatmap', statsController.getActivityHeatmap);

// Writing streaks
router.get('/streaks', statsController.getStreaks);

module.exports = router;

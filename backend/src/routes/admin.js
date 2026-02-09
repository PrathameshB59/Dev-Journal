const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize, isAdmin } = require('../middleware/authorize');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/unlock', adminController.unlockUser);
router.patch('/users/:id/ai', adminController.setUserAi);

// Coupon management
router.post('/coupons', adminController.createCoupon);
router.get('/coupons', adminController.getCoupons);
router.delete('/coupons/:id', adminController.deleteCoupon);

// System stats
router.get('/stats', adminController.getSystemStats);

// Entry management (for moderation)
router.get('/entries', adminController.getAllEntries);
router.delete('/entries/:id', adminController.deleteAnyEntry);

module.exports = router;

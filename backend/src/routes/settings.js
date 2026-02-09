const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const settings = require('../controllers/settingsController');

// All settings routes require authentication
router.use(protect);

router.get('/', settings.getSettings);
router.put('/profile', settings.updateProfile);
router.put('/password', settings.changePassword);
router.post('/redeem-coupon', settings.redeemCoupon);

module.exports = router;

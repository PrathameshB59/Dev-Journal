const User = require('../models/User');
const Coupon = require('../models/Coupon');

// GET /api/settings — Get current user's settings
exports.getSettings = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                aiEnabled: user.aiEnabled,
                aiPlan: user.aiPlan,
                aiExpiresAt: user.aiExpiresAt,
                couponUsed: user.couponUsed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/settings/profile — Update profile (name only)
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, data: { name: user.name } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/settings/password — Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
        }

        // Fetch user with password field
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/settings/redeem-coupon — Redeem a coupon code
exports.redeemCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, error: 'Coupon code is required' });
        }

        // Check if user already has active AI
        if (req.user.aiEnabled && req.user.aiPlan !== 'NONE' && req.user.aiExpiresAt > new Date()) {
            return res.status(400).json({ success: false, error: 'You already have an active AI subscription' });
        }

        // Find the coupon
        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Invalid or inactive coupon code' });
        }

        // Check if coupon has expired
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return res.status(400).json({ success: false, error: 'This coupon has expired' });
        }

        // Check if coupon has remaining uses
        if (coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ success: false, error: 'This coupon has reached its usage limit' });
        }

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + coupon.durationDays);

        // Update user AI fields
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                aiEnabled: true,
                aiPlan: 'COUPON',
                aiExpiresAt: expiresAt,
                couponUsed: coupon.code
            },
            { new: true }
        ).select('-password');

        // Increment coupon usage
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });

        res.json({
            success: true,
            message: `AI access activated for ${coupon.durationDays} days`,
            data: {
                aiEnabled: user.aiEnabled,
                aiPlan: user.aiPlan,
                aiExpiresAt: user.aiExpiresAt,
                couponUsed: user.couponUsed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

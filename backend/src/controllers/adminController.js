const User = require('../models/User');
const Entry = require('../models/Entry');
const Coupon = require('../models/Coupon');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
        if (req.query.search) {
            const safeSearch = escapeRegex(req.query.search);
            filter.$or = [
                { email: { $regex: safeSearch, $options: 'i' } },
                { name: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter)
        ]);

        // Get entry counts for each user
        const userIds = users.map(u => u._id);
        const entryCounts = await Entry.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]);

        const entryCountMap = entryCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});

        const usersWithCounts = users.map(user => ({
            ...user.toObject(),
            entryCount: entryCountMap[user._id.toString()] || 0
        }));

        res.json({
            success: true,
            data: {
                users: usersWithCounts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get single user (admin only)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user's entry stats
        const entryStats = await Entry.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalEntries = entryStats.reduce((sum, cat) => sum + cat.count, 0);

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                stats: {
                    totalEntries,
                    byCategory: entryStats
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
    try {
        const { role, isActive, name } = req.body;

        // Prevent admin from demoting themselves
        if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
            return res.status(400).json({
                success: false,
                error: 'You cannot change your own admin role'
            });
        }

        const updateFields = {};
        if (role !== undefined) updateFields.role = role;
        if (isActive !== undefined) updateFields.isActive = isActive;
        if (name !== undefined) updateFields.name = name;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Delete user's entries first
        await Entry.deleteMany({ userId: user._id });

        // Delete user's coupons
        await Coupon.deleteMany({ createdBy: user._id });

        // Delete the user
        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User and their data deleted successfully'
        });
    } catch (error) {
        console.error('[DELETE USER ERROR]', {
            userId: req.params.id,
            requestUser: req.user._id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Get system stats (admin only)
exports.getSystemStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalEntries,
            usersByRole,
            entriesByCategory,
            recentUsers,
            recentEntries
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            Entry.countDocuments(),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Entry.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
            User.find()
                .select('name email role isActive createdAt lastLogin')
                .sort({ createdAt: -1 })
                .limit(5),
            Entry.find()
                .select('title category userId createdAt')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Calculate entries per day for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const entriesPerDay = await Entry.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers: totalUsers - activeUsers,
                    totalEntries
                },
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                entriesByCategory: entriesByCategory.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                entriesPerDay,
                recentUsers,
                recentEntries
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get all entries (admin only - for moderation)
exports.getAllEntries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.search) {
            const safeSearch = escapeRegex(req.query.search);
            filter.$or = [
                { title: { $regex: safeSearch, $options: 'i' } },
                { content: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const [entries, total] = await Promise.all([
            Entry.find(filter)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Entry.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                entries,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// PATCH /api/admin/users/:id/ai — Set user AI access (admin only)
exports.setUserAi = async (req, res) => {
    try {
        const { aiEnabled, aiPlan, durationDays } = req.body;

        const updateFields = {};
        if (aiEnabled !== undefined) updateFields.aiEnabled = aiEnabled;
        if (aiPlan !== undefined) updateFields.aiPlan = aiPlan;

        if (durationDays) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);
            updateFields.aiExpiresAt = expiresAt;
        }

        // If disabling, clear expiry
        if (aiEnabled === false || aiPlan === 'NONE') {
            updateFields.aiEnabled = false;
            updateFields.aiPlan = 'NONE';
            updateFields.aiExpiresAt = null;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// POST /api/admin/coupons — Create a new coupon (admin only)
exports.createCoupon = async (req, res) => {
    try {
        const { code, durationDays, maxUses, expiresAt } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, error: 'Coupon code is required' });
        }

        const coupon = await Coupon.create({
            code: code.trim().toUpperCase(),
            durationDays: durationDays || 30,
            maxUses: maxUses || 1,
            expiresAt: expiresAt || null,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Coupon code already exists' });
        }
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/admin/coupons — List all coupons (admin only)
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// DELETE /api/admin/coupons/:id — Deactivate a coupon (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Coupon not found' });
        }

        res.json({ success: true, message: 'Coupon deactivated', data: coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Unlock user account (admin only)
exports.unlockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                loginAttempts: 0,
                lockUntil: null
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User account unlocked successfully',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Admin: Delete any user's entry (moderation)
exports.deleteAnyEntry = async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({
                success: false,
                error: 'Entry not found'
            });
        }

        await Entry.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: `Entry "${entry.name}" deleted successfully`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

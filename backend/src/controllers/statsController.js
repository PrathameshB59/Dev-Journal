const Entry = require('../models/Entry');

// Get dashboard stats for current user
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get total entries
        const totalEntries = await Entry.countDocuments({ userId });

        // Get entries by category
        const entriesByCategory = await Entry.aggregate([
            { $match: { userId } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get recent entries
        const recentEntries = await Entry.find({ userId })
            .select('title category createdAt updatedAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get all tags with counts
        const tagCloud = await Entry.aggregate([
            { $match: { userId } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // Get entries per day for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activityData = await Entry.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate total word count
        const wordCountData = await Entry.aggregate([
            { $match: { userId } },
            {
                $project: {
                    wordCount: {
                        $size: {
                            $split: [{ $ifNull: ['$content', ''] }, ' ']
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalWords: { $sum: '$wordCount' }
                }
            }
        ]);

        const totalWords = wordCountData[0]?.totalWords || 0;

        // Get this week's entries
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeekEntries = await Entry.countDocuments({
            userId,
            createdAt: { $gte: weekAgo }
        });

        // Get this month's entries
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const thisMonthEntries = await Entry.countDocuments({
            userId,
            createdAt: { $gte: monthAgo }
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalEntries,
                    totalWords,
                    thisWeekEntries,
                    thisMonthEntries,
                    averageWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0
                },
                entriesByCategory: entriesByCategory.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentEntries,
                tagCloud: tagCloud.map(t => ({ tag: t._id, count: t.count })),
                activityData
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get activity heatmap data
exports.getActivityHeatmap = async (req, res) => {
    try {
        const userId = req.user._id;
        const daysBack = parseInt(req.query.days) || 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const activityData = await Entry.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: startDate }
                }
            },
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
            data: activityData.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get writing streaks
exports.getStreaks = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all entry dates
        const entries = await Entry.find({ userId })
            .select('createdAt')
            .sort({ createdAt: 1 });

        if (entries.length === 0) {
            return res.json({
                success: true,
                data: {
                    currentStreak: 0,
                    longestStreak: 0,
                    totalDaysWithEntries: 0
                }
            });
        }

        // Get unique dates
        const uniqueDates = [...new Set(
            entries.map(e => e.createdAt.toISOString().split('T')[0])
        )].sort();

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if today or yesterday has an entry for current streak
        const hasToday = uniqueDates.includes(today);
        const hasYesterday = uniqueDates.includes(yesterday);

        if (hasToday || hasYesterday) {
            // Calculate current streak going backwards
            let checkDate = new Date(hasToday ? today : yesterday);

            while (uniqueDates.includes(checkDate.toISOString().split('T')[0])) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        // Calculate longest streak
        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1]);
            const currDate = new Date(uniqueDates[i]);
            const diffDays = Math.floor((currDate - prevDate) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        res.json({
            success: true,
            data: {
                currentStreak,
                longestStreak,
                totalDaysWithEntries: uniqueDates.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const Entry = require('../models/Entry');

// Get all entries with optional filtering
exports.getAllEntries = async (req, res) => {
    try {
        const { category, tag, sort = '-createdAt', limit = 50, page = 1 } = req.query;

        // Scope by authenticated user
        const query = { userId: req.user._id };

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = { $in: [tag.toLowerCase()] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const entries = await Entry.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Entry.countDocuments(query);

        res.json({
            success: true,
            data: entries,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single entry by ID
exports.getEntry = async (req, res) => {
    try {
        // Find entry owned by authenticated user
        const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        res.json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new entry
exports.createEntry = async (req, res) => {
    try {
        const { title, category, content, tags, codeLanguage, codeBlock } = req.body;

        const entry = await Entry.create({
            title,
            category,
            content,
            tags: tags || [],
            codeLanguage: codeLanguage || '',
            codeBlock: codeBlock || '',
            userId: req.user._id
        });

        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update entry
exports.updateEntry = async (req, res) => {
    try {
        const { title, category, content, tags, codeLanguage, codeBlock } = req.body;

        // Update only if owned by authenticated user
        const entry = await Entry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, category, content, tags, codeLanguage, codeBlock },
            { new: true, runValidators: true }
        );

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        res.json({ success: true, data: entry });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
    try {
        // Delete only if owned by authenticated user
        const entry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Search entries
exports.searchEntries = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }

        // Search only within user's entries
        const entries = await Entry.find(
            { $text: { $search: q }, userId: req.user._id },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(20);

        res.json({ success: true, data: entries });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all unique tags
exports.getAllTags = async (req, res) => {
    try {
        // Get tags only from user's entries
        const tags = await Entry.distinct('tags', { userId: req.user._id });
        res.json({ success: true, data: tags.filter(t => t) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get category stats
exports.getCategoryStats = async (req, res) => {
    try {
        // Get stats only from user's entries
        const stats = await Entry.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

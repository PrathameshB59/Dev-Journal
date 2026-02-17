const Entry = require('../models/Entry');
const EntryVersion = require('../models/EntryVersion');
const { createEntrySnapshot } = require('../services/entryVersionService');

const parseVersionParam = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Get all entries with optional filtering
exports.getAllEntries = async (req, res) => {
    try {
        const ALLOWED_SORT = ['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title', 'category', '-category'];
        const { category, tag, sort: rawSort = '-createdAt', limit = 50, page = 1 } = req.query;
        const sort = ALLOWED_SORT.includes(rawSort) ? rawSort : '-createdAt';

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
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Create new entry
exports.createEntry = async (req, res) => {
    try {
        const { title, name, category, content, tags, codeLanguage, codeBlock } = req.body;
        const resolvedName = (name || title || '').trim();

        const entry = await Entry.create({
            name: resolvedName,
            title: (title || resolvedName || '').trim(),
            category,
            type: 'file',
            parentId: null,
            mime: 'text/markdown',
            content,
            tags: tags || [],
            codeLanguage: codeLanguage || '',
            codeBlock: codeBlock || '',
            userId: req.user._id
        });

        await createEntrySnapshot(entry, 'create');
        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Update entry
exports.updateEntry = async (req, res) => {
    try {
        const { title, name, category, content, tags, codeLanguage, codeBlock } = req.body;
        const updates = {};

        if (title !== undefined) {
            updates.title = title;
            if (!name) {
                updates.name = title;
            }
        }
        if (name !== undefined) updates.name = name;
        if (category !== undefined) updates.category = category;
        if (content !== undefined) updates.content = content;
        if (tags !== undefined) updates.tags = tags;
        if (codeLanguage !== undefined) updates.codeLanguage = codeLanguage;
        if (codeBlock !== undefined) updates.codeBlock = codeBlock;

        // Update only if owned by authenticated user
        const entry = await Entry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        await createEntrySnapshot(entry, 'update');
        res.json({ success: true, data: entry });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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

        await EntryVersion.deleteMany({ entryId: entry._id, userId: req.user._id });
        res.json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get all unique tags
exports.getAllTags = async (req, res) => {
    try {
        // Get tags only from user's entries
        const tags = await Entry.distinct('tags', { userId: req.user._id });
        res.json({ success: true, data: tags.filter(t => t) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/entries/:id/versions
exports.getEntryVersions = async (req, res) => {
    try {
        const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id })
            .select('_id type')
            .lean();

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        if (entry.type !== 'file') {
            return res.json({ success: true, data: [] });
        }

        const versions = await EntryVersion.find({ entryId: entry._id, userId: req.user._id })
            .sort({ version: -1 })
            .limit(100)
            .lean();

        if (versions.length === 0) {
            const currentEntry = await Entry.findOne({ _id: entry._id, userId: req.user._id });
            if (currentEntry && currentEntry.type === 'file') {
                await createEntrySnapshot(currentEntry, 'create');
            }
        }

        const refreshedVersions = versions.length === 0
            ? await EntryVersion.find({ entryId: entry._id, userId: req.user._id })
                .sort({ version: -1 })
                .limit(100)
                .lean()
            : versions;

        res.json({
            success: true,
            data: refreshedVersions.map((versionDoc) => ({
                _id: versionDoc._id,
                version: versionDoc.version,
                changeType: versionDoc.changeType,
                createdAt: versionDoc.createdAt,
                name: versionDoc.name
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/entries/:id/versions/:version
exports.getEntryVersion = async (req, res) => {
    try {
        const versionNumber = parseVersionParam(req.params.version);
        if (!versionNumber) {
            return res.status(400).json({ success: false, error: 'Invalid version number' });
        }

        const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id })
            .select('_id type')
            .lean();

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        const versionDoc = await EntryVersion.findOne({
            entryId: entry._id,
            userId: req.user._id,
            version: versionNumber
        }).lean();

        if (!versionDoc) {
            return res.status(404).json({ success: false, error: 'Version not found' });
        }

        res.json({ success: true, data: versionDoc });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// POST /api/entries/:id/versions/:version/restore
exports.restoreEntryVersion = async (req, res) => {
    try {
        const versionNumber = parseVersionParam(req.params.version);
        if (!versionNumber) {
            return res.status(400).json({ success: false, error: 'Invalid version number' });
        }

        const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }
        if (entry.type !== 'file') {
            return res.status(400).json({ success: false, error: 'Only file entries can be restored' });
        }

        const versionDoc = await EntryVersion.findOne({
            entryId: entry._id,
            userId: req.user._id,
            version: versionNumber
        });

        if (!versionDoc) {
            return res.status(404).json({ success: false, error: 'Version not found' });
        }

        entry.name = versionDoc.name || entry.name;
        entry.title = versionDoc.name || entry.title || entry.name;
        entry.content = versionDoc.content || '';
        entry.tags = Array.isArray(versionDoc.tags) ? versionDoc.tags : [];
        entry.codeLanguage = versionDoc.codeLanguage || '';
        entry.codeBlock = versionDoc.codeBlock || '';
        entry.mime = versionDoc.mime || entry.mime;
        entry.category = versionDoc.category || '';
        entry.type = versionDoc.type || entry.type;
        entry.asset = versionDoc.asset || {};

        await entry.save();
        await createEntrySnapshot(entry, 'restore');

        res.json({
            success: true,
            data: entry,
            meta: { restoredFromVersion: versionNumber }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

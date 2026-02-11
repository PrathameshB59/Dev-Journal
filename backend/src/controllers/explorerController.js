const Entry = require('../models/Entry');
const mongoose = require('mongoose');

// Default root folders created on first access
const DEFAULT_FOLDERS = [
    { name: 'Daily Learning', pinned: true },
    { name: 'Project Notes', pinned: true },
    { name: 'Bug Fixes', pinned: true },
    { name: 'Code Snippets', pinned: true },
    { name: 'Concepts', pinned: true }
];

// GET /api/explorer/root — Root-level entries (auto-creates default folders)
exports.getRoot = async (req, res) => {
    try {
        const userId = req.user._id;

        // Auto-create default folders on first access
        const folderCount = await Entry.countDocuments({ userId, type: 'folder', parentId: null });
        if (folderCount === 0) {
            const folders = DEFAULT_FOLDERS.map(f => ({
                name: f.name,
                type: 'folder',
                parentId: null,
                mime: 'folder',
                pinned: f.pinned,
                favorite: false,
                content: '',
                tags: [],
                userId
            }));
            await Entry.insertMany(folders);
        }

        const ALLOWED_SORT = ['name', 'createdAt', 'updatedAt', 'category', 'title'];
        const { sort: rawSort = 'name', order = 'asc' } = req.query;
        const sort = ALLOWED_SORT.includes(rawSort) ? rawSort : 'name';
        const sortObj = {};
        sortObj.type = -1; // folders first
        sortObj[sort] = order === 'desc' ? -1 : 1;

        const entries = await Entry.find({ userId, parentId: null })
            .sort(sortObj)
            .lean();

        res.json({ success: true, data: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/explorer/folder/:id — Folder contents + metadata
exports.getFolder = async (req, res) => {
    try {
        const userId = req.user._id;
        const folderId = req.params.id;

        // Verify folder exists and belongs to user
        const folder = await Entry.findOne({ _id: folderId, userId, type: 'folder' }).lean();
        if (!folder) {
            return res.status(404).json({ success: false, error: 'Folder not found' });
        }

        const ALLOWED_SORT = ['name', 'createdAt', 'updatedAt', 'category', 'title'];
        const { sort: rawSort = 'name', order = 'asc' } = req.query;
        const sort = ALLOWED_SORT.includes(rawSort) ? rawSort : 'name';
        const sortObj = {};
        sortObj.type = -1; // folders first
        sortObj[sort] = order === 'desc' ? -1 : 1;

        const children = await Entry.find({ userId, parentId: folderId })
            .sort(sortObj)
            .lean();

        res.json({
            success: true,
            data: {
                folder,
                children
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// POST /api/explorer/file — Create a file
exports.createFile = async (req, res) => {
    try {
        const { name, content, tags, codeLanguage, codeBlock, parentId, mime } = req.body;

        // If parentId provided, verify it's a valid folder owned by user
        if (parentId) {
            const parent = await Entry.findOne({ _id: parentId, userId: req.user._id, type: 'folder' });
            if (!parent) {
                return res.status(400).json({ success: false, error: 'Parent folder not found' });
            }
        }

        const entry = await Entry.create({
            name,
            type: 'file',
            parentId: parentId || null,
            mime: mime || 'text/markdown',
            pinned: false,
            favorite: false,
            content: content || '',
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// POST /api/explorer/folder — Create a folder
exports.createFolder = async (req, res) => {
    try {
        const { name, parentId } = req.body;

        // If parentId provided, verify it's a valid folder owned by user
        if (parentId) {
            const parent = await Entry.findOne({ _id: parentId, userId: req.user._id, type: 'folder' });
            if (!parent) {
                return res.status(400).json({ success: false, error: 'Parent folder not found' });
            }
        }

        const folder = await Entry.create({
            name,
            type: 'folder',
            parentId: parentId || null,
            mime: 'folder',
            pinned: false,
            favorite: false,
            content: '',
            tags: [],
            userId: req.user._id
        });

        res.status(201).json({ success: true, data: folder });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// PATCH /api/explorer/:id — Update entry (name, content, tags, pinned, favorite)
exports.updateEntry = async (req, res) => {
    try {
        const allowedFields = ['name', 'content', 'tags', 'codeLanguage', 'codeBlock', 'pinned', 'favorite', 'mime'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const entry = await Entry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
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
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// DELETE /api/explorer/:id — Delete entry (recursive for folders)
exports.deleteEntry = async (req, res) => {
    try {
        const userId = req.user._id;
        const entry = await Entry.findOne({ _id: req.params.id, userId });

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        if (entry.type === 'folder') {
            // Recursively collect all descendant IDs
            const idsToDelete = [entry._id];
            const queue = [entry._id];

            while (queue.length > 0) {
                const parentId = queue.shift();
                const children = await Entry.find({ parentId, userId }).select('_id type').lean();
                for (const child of children) {
                    idsToDelete.push(child._id);
                    if (child.type === 'folder') {
                        queue.push(child._id);
                    }
                }
            }

            await Entry.deleteMany({ _id: { $in: idsToDelete }, userId });
            res.json({ success: true, data: { deletedCount: idsToDelete.length } });
        } else {
            await Entry.deleteOne({ _id: entry._id });
            res.json({ success: true, data: { deletedCount: 1 } });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/explorer/breadcrumb/:id — Build breadcrumb path
exports.getBreadcrumb = async (req, res) => {
    try {
        const userId = req.user._id;
        const crumbs = [];
        let currentId = req.params.id;

        // Walk up the parentId chain (max 20 levels to prevent infinite loops)
        let depth = 0;
        while (currentId && depth < 20) {
            const entry = await Entry.findOne({ _id: currentId, userId })
                .select('name parentId type')
                .lean();

            if (!entry) break;

            crumbs.unshift({ _id: entry._id, name: entry.name, type: entry.type });
            currentId = entry.parentId;
            depth++;
        }

        res.json({ success: true, data: crumbs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// PATCH /api/explorer/:id/move — Move entry to a different parent
exports.moveEntry = async (req, res) => {
    try {
        const userId = req.user._id;
        const { newParentId } = req.body;

        const entry = await Entry.findOne({ _id: req.params.id, userId });
        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        // Validate newParentId (null = move to root)
        if (newParentId) {
            const parent = await Entry.findOne({ _id: newParentId, userId, type: 'folder' });
            if (!parent) {
                return res.status(400).json({ success: false, error: 'Target folder not found' });
            }

            // Prevent moving a folder into itself or its own descendants
            if (entry.type === 'folder') {
                let checkId = newParentId;
                while (checkId) {
                    if (checkId.toString() === entry._id.toString()) {
                        return res.status(400).json({ success: false, error: 'Cannot move folder into itself' });
                    }
                    const ancestor = await Entry.findOne({ _id: checkId, userId }).select('parentId').lean();
                    checkId = ancestor ? ancestor.parentId : null;
                }
            }
        }

        entry.parentId = newParentId || null;
        await entry.save();

        res.json({ success: true, data: entry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/explorer/search — Text search scoped to user
exports.searchEntries = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }

        const entries = await Entry.find(
            { $text: { $search: q }, userId: req.user._id, type: 'file' },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(30)
            .lean();

        res.json({ success: true, data: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/explorer/favorites — Get all favorited entries
exports.getFavorites = async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.user._id, favorite: true })
            .sort({ updatedAt: -1 })
            .lean();

        res.json({ success: true, data: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/explorer/recent — Get recently modified files
exports.getRecent = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        const entries = await Entry.find({ userId: req.user._id, type: 'file' })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        res.json({ success: true, data: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /api/explorer/tags — Get all unique tags
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Entry.distinct('tags', { userId: req.user._id });
        res.json({ success: true, data: tags.filter(t => t) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

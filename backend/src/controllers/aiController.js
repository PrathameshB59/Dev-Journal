const Entry = require('../models/Entry');
const { callAtlasAI, isAtlasHealthy } = require('../services/atlasClient');

/**
 * Middleware: Check if user has AI access enabled.
 */
exports.checkAiAccess = (req, res, next) => {
    const user = req.user;

    if (!user.aiEnabled || user.aiPlan === 'NONE') {
        return res.status(403).json({ success: false, error: 'AI features not enabled for your account' });
    }

    if (user.aiExpiresAt && user.aiExpiresAt < new Date()) {
        return res.status(403).json({ success: false, error: 'AI subscription has expired' });
    }

    next();
};

// POST /api/ai/summarize — Summarize a folder's contents
exports.summarize = async (req, res) => {
    try {
        const { folderId } = req.body;
        if (!folderId) {
            return res.status(400).json({ success: false, error: 'folderId is required' });
        }

        const folder = await Entry.findOne({ _id: folderId, userId: req.user._id, type: 'folder' }).lean();
        if (!folder) {
            return res.status(404).json({ success: false, error: 'Folder not found' });
        }

        const files = await Entry.find({ parentId: folderId, userId: req.user._id, type: 'file' })
            .select('name content tags')
            .limit(20)
            .lean();

        if (files.length === 0) {
            return res.json({ success: true, data: { content: 'This folder has no files to summarize.' } });
        }

        const prompt = `Summarize the following developer journal entries from the folder "${folder.name}":\n\n` +
            files.map((f, i) => `--- Entry ${i + 1}: ${f.name} ---\n${f.content || '(empty)'}\n`).join('\n');

        const result = await callAtlasAI('summarize', req.user._id, prompt);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/ai/explain — Explain a single entry
exports.explain = async (req, res) => {
    try {
        const { entryId } = req.body;
        if (!entryId) {
            return res.status(400).json({ success: false, error: 'entryId is required' });
        }

        const entry = await Entry.findOne({ _id: entryId, userId: req.user._id, type: 'file' }).lean();
        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        const prompt = `Explain the following developer journal entry titled "${entry.name}":\n\n${entry.content || '(empty)'}` +
            (entry.codeBlock ? `\n\nCode:\n\`\`\`${entry.codeLanguage || ''}\n${entry.codeBlock}\n\`\`\`` : '');

        const result = await callAtlasAI('explain', req.user._id, prompt);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/ai/quick-help — Quick AI question with recent journal context
exports.quickHelp = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, error: 'question is required' });
        }

        // Fetch recent entries as context
        const recentFiles = await Entry.find({ userId: req.user._id, type: 'file' })
            .sort({ updatedAt: -1 })
            .select('name content')
            .limit(5)
            .lean();

        let prompt = `Developer question: ${question.trim()}`;
        if (recentFiles.length > 0) {
            prompt += '\n\nContext from recent journal entries:\n' +
                recentFiles.map(f => `- ${f.name}: ${(f.content || '').slice(0, 300)}`).join('\n');
        }

        const result = await callAtlasAI('quick', req.user._id, prompt);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/ai/status — AI status for the current user
exports.getStatus = async (req, res) => {
    try {
        const user = req.user;
        const atlasHealthy = await isAtlasHealthy();

        res.json({
            success: true,
            data: {
                aiEnabled: user.aiEnabled,
                aiPlan: user.aiPlan,
                aiExpiresAt: user.aiExpiresAt,
                atlasAvailable: atlasHealthy
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const EntryVersion = require('../models/EntryVersion');

const MAX_VERSIONS_PER_ENTRY = 100;

const normalizeAssetSnapshot = (asset) => {
    if (!asset || typeof asset !== 'object') {
        return {
            url: '',
            path: '',
            kind: '',
            originalName: '',
            sizeBytes: 0,
            storage: ''
        };
    }

    return {
        url: asset.url || '',
        path: asset.path || '',
        kind: asset.kind || '',
        originalName: asset.originalName || '',
        sizeBytes: Number(asset.sizeBytes) || 0,
        storage: asset.storage || ''
    };
};

const getSnapshotFromEntry = (entry) => ({
    name: entry.name || entry.title || '',
    content: entry.content || '',
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    codeLanguage: entry.codeLanguage || '',
    codeBlock: entry.codeBlock || '',
    mime: entry.mime || 'text/markdown',
    type: entry.type || 'file',
    category: entry.category || '',
    asset: normalizeAssetSnapshot(entry.asset)
});

const createEntrySnapshot = async (entry, changeType = 'update') => {
    if (!entry || !entry._id || !entry.userId) return null;
    if (entry.type && entry.type !== 'file') return null;

    const entryId = entry._id;
    const userId = entry.userId;

    const latest = await EntryVersion.findOne({ entryId, userId })
        .sort({ version: -1 })
        .select('version')
        .lean();

    const nextVersion = (latest?.version || 0) + 1;
    const snapshot = getSnapshotFromEntry(entry);

    const versionDoc = await EntryVersion.create({
        entryId,
        userId,
        version: nextVersion,
        changeType,
        ...snapshot
    });

    const staleVersions = await EntryVersion.find({ entryId, userId })
        .sort({ version: -1 })
        .skip(MAX_VERSIONS_PER_ENTRY)
        .select('_id')
        .lean();

    if (staleVersions.length > 0) {
        await EntryVersion.deleteMany({ _id: { $in: staleVersions.map((v) => v._id) } });
    }

    return versionDoc;
};

module.exports = {
    MAX_VERSIONS_PER_ENTRY,
    getSnapshotFromEntry,
    createEntrySnapshot
};

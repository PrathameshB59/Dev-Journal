const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    // Virtual Filesystem fields
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [200, 'Name cannot exceed 200 characters']
    },
    type: {
        type: String,
        enum: ['file', 'folder'],
        default: 'file'
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry',
        default: null  // null = root level
    },
    mime: {
        type: String,
        default: 'text/markdown'
    },
    pinned: {
        type: Boolean,
        default: false
    },
    favorite: {
        type: Boolean,
        default: false
    },

    // Content fields (files only)
    content: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    codeLanguage: {
        type: String,
        trim: true,
        default: ''
    },
    codeBlock: {
        type: String,
        default: ''
    },

    // Legacy fields (kept for backward compatibility during migration)
    title: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: {
            values: ['daily-learning', 'project-note', 'bug-fix', 'code-snippet', 'concept', ''],
            message: 'Invalid category'
        }
    },

    // Ownership
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // AI - Vector embedding (populated by embedding generation)
    embedding: {
        type: [Number],
        select: false  // Don't include in normal queries (large field)
    }
}, {
    timestamps: true
});

// Virtual filesystem indexes
entrySchema.index({ parentId: 1, userId: 1 });
entrySchema.index({ type: 1, userId: 1 });
entrySchema.index({ pinned: 1, userId: 1 });
entrySchema.index({ favorite: 1, userId: 1 });

// Search index
entrySchema.index({ name: 'text', content: 'text', tags: 'text' });

// Date sorting
entrySchema.index({ createdAt: -1 });

// Compound indexes for user-scoped queries
entrySchema.index({ userId: 1, createdAt: -1 });
entrySchema.index({ userId: 1, type: 1, parentId: 1 });

module.exports = mongoose.model('Entry', entrySchema);

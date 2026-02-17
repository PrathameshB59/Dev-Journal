const mongoose = require('mongoose');

const entryVersionSchema = new mongoose.Schema({
    entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    version: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        trim: true,
        default: ''
    },
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
    mime: {
        type: String,
        default: 'text/markdown'
    },
    type: {
        type: String,
        enum: ['file', 'folder'],
        default: 'file'
    },
    category: {
        type: String,
        default: ''
    },
    asset: {
        url: {
            type: String,
            default: ''
        },
        path: {
            type: String,
            default: ''
        },
        kind: {
            type: String,
            enum: ['image', 'audio', 'video', ''],
            default: ''
        },
        originalName: {
            type: String,
            default: ''
        },
        sizeBytes: {
            type: Number,
            default: 0
        },
        storage: {
            type: String,
            enum: ['local', ''],
            default: ''
        }
    },
    changeType: {
        type: String,
        enum: ['create', 'update', 'restore'],
        default: 'update'
    }
}, {
    timestamps: true
});

entryVersionSchema.index({ entryId: 1, version: -1 });
entryVersionSchema.index({ userId: 1, entryId: 1, version: -1 });

module.exports = mongoose.model('EntryVersion', entryVersionSchema);

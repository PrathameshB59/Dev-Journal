const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['daily-learning', 'project-note', 'bug-fix', 'code-snippet', 'concept'],
            message: 'Invalid category'
        }
    },
    content: {
        type: String,
        required: [true, 'Content is required']
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
    }
}, {
    timestamps: true
});

// Index for search functionality
entrySchema.index({ title: 'text', content: 'text', tags: 'text' });

// Index for category filtering
entrySchema.index({ category: 1 });

// Index for date sorting
entrySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Entry', entrySchema);

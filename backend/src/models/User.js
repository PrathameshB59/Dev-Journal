const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false  // Don't include password in queries by default
    },
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    // RBAC fields
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Security fields
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    passwordChangedAt: {
        type: Date
    },
    // AI subscription fields
    aiEnabled: {
        type: Boolean,
        default: false
    },
    aiPlan: {
        type: String,
        enum: ['NONE', 'PAID', 'COUPON'],
        default: 'NONE'
    },
    aiExpiresAt: {
        type: Date
    },
    couponUsed: {
        type: String
    }
}, {
    timestamps: true
});

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Note: email index is already created by unique: true

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

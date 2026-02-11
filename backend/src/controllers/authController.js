const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({ email, password, name });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        // Find user and include password and security fields
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                error: `Account locked. Try again in ${remainingTime} minutes.`
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Your account has been deactivated. Contact support.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                await user.save();
                return res.status(423).json({
                    success: false,
                    error: 'Too many failed attempts. Account locked for 30 minutes.'
                });
            }

            await user.save();
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                attemptsRemaining: 5 - user.loginAttempts
            });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        }
    });
};

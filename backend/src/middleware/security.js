const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        error: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

// Rate limiting for API routes (prevent abuse)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        error: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for registration (prevent spam accounts)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per hour per IP
    message: {
        success: false,
        error: 'Too many accounts created. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Security headers using Helmet
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for inline scripts
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for inline styles
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false, // Allow loading external resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: { maxAge: 31536000, includeSubDomains: true }
});

// XSS protection middleware
const xssProtection = (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};

// Prevent clickjacking
const frameGuard = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
};

// Content type sniffing protection
const noSniff = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
};

module.exports = {
    authLimiter,
    apiLimiter,
    registerLimiter,
    securityHeaders,
    xssProtection,
    frameGuard,
    noSniff
};

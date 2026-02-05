/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 *
 * Role Hierarchy:
 * - admin: Full access to all resources
 * - moderator: Can view all users, moderate content
 * - user: Can only access own resources
 */

// Authorization middleware - checks if user has required role
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure user is authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Check if user's account is active
        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Your account has been deactivated. Contact support.'
            });
        }

        // Check if user has one of the allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};

// Check if user is at least moderator
const isModerator = (req, res, next) => {
    if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Moderator access required'
        });
    }
    next();
};

// Check resource ownership (for user-specific resources)
const isOwnerOrAdmin = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        // Admins can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.resource?.[resourceUserIdField] || req.body?.[resourceUserIdField];

        if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'You can only access your own resources'
            });
        }

        next();
    };
};

module.exports = {
    authorize,
    isAdmin,
    isModerator,
    isOwnerOrAdmin
};

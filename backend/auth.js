const bcrypt = require('bcryptjs');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Middleware to check if user is the regular user (not admin)
function requireUser(req, res, next) {
    if (!req.session.userId || req.session.userRole !== 'user') {
        return res.status(403).json({ error: 'User access required' });
    }
    next();
}

// Verify password
async function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireUser,
    verifyPassword
};

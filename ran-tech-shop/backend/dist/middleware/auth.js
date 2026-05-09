"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Authentication middleware - requires valid JWT token
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'No authorization header provided' });
            return;
        }
        // Check for Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        // Verify token
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        // Attach user info to request
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};
exports.authenticate = authenticate;
/**
 * Optional authentication - sets user if valid token exists, but doesn't require it
 */
const optionalAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const decoded = (0, jwt_1.verifyToken)(token);
                if (decoded) {
                    req.user = decoded;
                }
            }
        }
        next();
    }
    catch (error) {
        // Silently continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map
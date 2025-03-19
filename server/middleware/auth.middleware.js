/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user information to requests.
 * Used to protect routes that require authentication.
 * @module middleware/auth.middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware function
 * Verifies JWT token from request headers and attaches user to request object
 * 
 * @async
 * @function authMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @throws {401} If no token is provided
 * @throws {401} If token is invalid
 * @throws {401} If user not found
 * 
 * @example
 * // Usage in routes
 * router.get('/protected-route', authMiddleware, (req, res) => {
 *   // Access authenticated user via req.user
 * });
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        // Format: "Bearer <token>"
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Authentication required' 
            });
        }

        // Verify token and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID from token
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }

        // Attach user object to request for use in subsequent middleware/routes
        req.user = user;
        next();
    } catch (error) {
        // Handle invalid/expired tokens
        res.status(401).json({ 
            message: 'Invalid token' 
        });
    }
};

module.exports = authMiddleware;

/**
 * Authentication Controller
 * Handles user authentication including registration, login, Google OAuth,
 * and user information retrieval.
 * @module controllers/auth.controller
 */

const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Controller for handling authentication operations
 * @typedef {Object} AuthController
 */
const authController = {
    /**
     * Registers a new user in the system.
     * Performs email uniqueness check (case-insensitive) and creates JWT token.
     * 
     * @async
     * @function register
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User's email address
     * @param {string} req.body.password - User's password
     * @param {string} req.body.name - User's full name
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with user data and token
     * 
     * @throws {400} If email is already registered
     * @throws {500} If registration fails
     * 
     * @example
     * // Request body:
     * {
     *   "email": "user@example.com",
     *   "password": "securePassword123",
     *   "name": "John Doe"
     * }
     * 
     * // Success response:
     * {
     *   "token": "jwt.token.here",
     *   "user": {
     *     "id": "userId",
     *     "email": "user@example.com",
     *     "name": "John Doe",
     *     "avatar": "avatar_url"
     *   }
     * }
     */
    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Case-insensitive email check
            const existingUser = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Email already registered. Please login or use a different email.' 
                });
            }

            // Create new user with lowercase email
            const user = new User({
                email: email.toLowerCase(),
                password,
                name
            });

            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating account', error: error.message });
        }
    },

    /**
     * Authenticates a user with email and password.
     * Updates last login timestamp and generates JWT token.
     * 
     * @async
     * @function login
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User's email address
     * @param {string} req.body.password - User's password
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with user data and token
     * 
     * @throws {401} If credentials are invalid
     * @throws {500} If login fails
     * 
     * @example
     * // Request body:
     * {
     *   "email": "user@example.com",
     *   "password": "securePassword123"
     * }
     * 
     * // Success response:
     * {
     *   "token": "jwt.token.here",
     *   "user": {
     *     "id": "userId",
     *     "email": "user@example.com",
     *     "name": "John Doe",
     *     "avatar": "avatar_url"
     *   }
     * }
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Update last login timestamp
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    },

    /**
     * Handles Google OAuth authentication.
     * Verifies Google token, creates or updates user, and generates JWT token.
     * 
     * @async
     * @function googleAuth
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.credential - Google OAuth credential token
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with user data and token
     * 
     * @throws {400} If credential is missing or invalid
     * @throws {500} If Google authentication fails
     * 
     * @example
     * // Request body:
     * {
     *   "credential": "google.oauth.token.here"
     * }
     * 
     * // Success response:
     * {
     *   "token": "jwt.token.here",
     *   "user": {
     *     "id": "userId",
     *     "email": "user@example.com",
     *     "name": "John Doe",
     *     "avatar": "google_avatar_url"
     *   }
     * }
     */
    googleAuth: async (req, res) => {
        try {
            const { credential } = req.body;
            
            if (!credential) {
                return res.status(400).json({ message: 'No credential provided' });
            }

            // Verify Google token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            const { email, name, picture: avatar, sub: googleId } = payload;

            // Case-insensitive email check
            let user = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            });
            
            if (user) {
                // Update existing user with Google info if needed
                if (!user.googleId) {
                    user.googleId = googleId;
                    user.avatar = avatar;
                    await user.save();
                }
            } else {
                // Create new user with Google info
                user = await User.create({
                    email: email.toLowerCase(),
                    name,
                    avatar,
                    googleId
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Google auth error:', error);
            res.status(400).json({ 
                message: 'Error authenticating with Google',
                error: error.message 
            });
        }
    },

    /**
     * Retrieves user information by ID.
     * Excludes sensitive information like password from the response.
     * 
     * @async
     * @function getUser
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.userId - User ID to retrieve
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with user data
     * 
     * @throws {404} If user is not found
     * @throws {500} If retrieval fails
     * 
     * @example
     * // Success response:
     * {
     *   "id": "userId",
     *   "email": "user@example.com",
     *   "name": "John Doe",
     *   "avatar": "avatar_url"
     * }
     */
    getUser: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId).select('-password');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error: error.message });
        }
    }
};

module.exports = authController;

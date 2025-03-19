/**
 * Authentication routes configuration.
 * Handles all routes related to user authentication including login, registration,
 * Google OAuth, and user information retrieval.
 * @module routes/auth.routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @route POST /api/auth/login
 * @description Authenticate a user with email and password
 * @access Public
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @returns {object} User data and authentication token
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * @body {string} name - User's full name
 * @returns {object} New user data and authentication token
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/google
 * @description Authenticate or register a user with Google OAuth
 * @access Public
 * @body {string} credential - Google OAuth credential token
 * @returns {object} User data and authentication token
 */
router.post('/google', authController.googleAuth);

/**
 * @route GET /api/auth/user/:userId
 * @description Get user information by ID
 * @access Private - Requires authentication
 * @param {string} userId - The ID of the user to retrieve
 * @returns {object} User data (excluding sensitive information)
 */
router.get('/user/:userId', authMiddleware, authController.getUser);

module.exports = router;

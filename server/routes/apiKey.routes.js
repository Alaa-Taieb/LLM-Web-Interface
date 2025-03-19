/**
 * API Key routes configuration.
 * Handles all routes related to API key management including creation, retrieval,
 * verification, and deletion of API keys. All routes require authentication.
 * @module routes/apiKey.routes
 */

const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKey.controller');
const auth = require('../middleware/auth.middleware');

// Protect all routes with authentication middleware
router.use(auth);

/**
 * @route GET /api/keys
 * @description Get all API keys for the authenticated user
 * @access Private
 * @returns {Array<object>} List of API keys with metadata (excluding actual key values)
 */
router.get('/', apiKeyController.getAllKeys);

/**
 * @route POST /api/keys
 * @description Create a new API key for the authenticated user
 * @access Private
 * @body {string} name - Optional name for the API key
 * @body {string} key - The API key value to store
 * @returns {object} Created API key metadata
 */
router.post('/', apiKeyController.addKey);

/**
 * @route GET /api/keys/:id
 * @description Get a specific API key by ID
 * @access Private
 * @param {string} id - The ID of the API key to retrieve
 * @returns {object} API key data including the actual key value
 */
router.get('/:id', apiKeyController.getKey);

/**
 * @route DELETE /api/keys/:id
 * @description Delete an API key by ID
 * @access Private
 * @param {string} id - The ID of the API key to delete
 * @returns {object} Confirmation message
 */
router.delete('/:id', apiKeyController.deleteKey);

/**
 * @route POST /api/keys/verify
 * @description Verify the validity of an API key
 * @access Private
 * @body {string} key - The API key to verify
 * @returns {object} Verification result
 */
router.post('/verify', apiKeyController.verifyKey);

module.exports = router;

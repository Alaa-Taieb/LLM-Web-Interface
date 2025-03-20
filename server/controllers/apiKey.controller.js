/**
 * API Key Controller
 * Handles CRUD operations for Groq API keys, including creation, retrieval,
 * verification, and deletion of API keys. Each key is associated with a user.
 * @module controllers/apiKey.controller
 */

const ApiKey = require('../models/apiKey.model');

/**
 * Controller for handling API key operations
 * @typedef {Object} ApiKeyController
 */
const apiKeyController = {
    /**
     * Retrieves all API keys for the authenticated user.
     * Returns metadata only, excluding actual key values for security.
     * 
     * @async
     * @function getAllKeys
     * @param {Object} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user._id - User ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with array of API keys
     * 
     * @throws {500} If database operation fails
     * 
     * @example
     * // Success response:
     * [
     *   {
     *     "_id": "keyId1",
     *     "name": "Production Key",
     *     "createdAt": "2024-01-01T00:00:00.000Z",
     *     "lastUsed": "2024-01-02T00:00:00.000Z"
     *   },
     *   // ... more keys
     * ]
     */
    getAllKeys: async (req, res) => {
        try {
            const keys = await ApiKey.find({ user: req.user._id })
                .select('_id name createdAt lastUsed')
                .sort('-createdAt');
            res.json(keys);
        } catch (error) {
            console.error('Error fetching API keys:', error);
            res.status(500).json({ message: 'Error fetching API keys' });
        }
    },

    /**
     * Creates a new API key for the authenticated user.
     * Checks for duplicate keys and assigns default name if none provided.
     * 
     * @async
     * @function addKey
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.key - The Groq API key to store
     * @param {string} [req.body.name] - Optional name for the API key
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user._id - User ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with created key metadata
     * 
     * @throws {400} If key is missing or already exists
     * @throws {500} If creation fails
     * 
     * @example
     * // Request body:
     * {
     *   "key": "grk_abc...",
     *   "name": "Development Key"
     * }
     * 
     * // Success response:
     * {
     *   "id": "keyId",
     *   "name": "Development Key",
     *   "createdAt": "2024-01-01T00:00:00.000Z"
     * }
     */
    addKey: async (req, res) => {
        try {
            const { name, key } = req.body;
            
            if (!key) {
                return res.status(400).json({ message: 'API key is required' });
            }

            const existingKey = await ApiKey.findOne({
                user: req.user._id,
                key: key
            });

            if (existingKey) {
                return res.status(400).json({ message: 'This API key already exists' });
            }

            const newApiKey = new ApiKey({
                name: name || 'Default Key',
                key,
                user: req.user._id
            });

            await newApiKey.save();
            
            res.status(201).json({
                id: newApiKey._id,
                name: newApiKey.name,
                createdAt: newApiKey.createdAt
            });
        } catch (error) {
            console.error('Error adding API key:', error);
            res.status(500).json({ message: 'Error adding API key' });
        }
    },

    /**
     * Deletes an API key by ID.
     * Verifies ownership before deletion.
     * 
     * @async
     * @function deleteKey
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.id - ID of the API key to delete
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user._id - User ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response confirming deletion
     * 
     * @throws {404} If key is not found
     * @throws {500} If deletion fails
     * 
     * @example
     * // Success response:
     * {
     *   "message": "API key deleted successfully"
     * }
     */
    deleteKey: async (req, res) => {
        try {
            const key = await ApiKey.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!key) {
                return res.status(404).json({ message: 'API key not found' });
            }

            await key.deleteOne();
            res.json({ message: 'API key deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting API key' });
        }
    },

    /**
     * Verifies an API key exists and updates its last used timestamp.
     * Used to validate keys before using them with the Groq API.
     * 
     * @async
     * @function verifyKey
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.key - The API key to verify
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user._id - User ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with verification result
     * 
     * @throws {404} If key is not found
     * @throws {500} If verification fails
     * 
     * @example
     * // Request body:
     * {
     *   "key": "grk_abc..."
     * }
     * 
     * // Success response:
     * {
     *   "valid": true
     * }
     */
    verifyKey: async (req, res) => {
        try {
            const { key } = req.body;
            const apiKey = await ApiKey.findOne({
                key,
                user: req.user._id
            });

            if (!apiKey) {
                return res.status(404).json({ message: 'API key not found' });
            }

            apiKey.lastUsed = new Date();
            await apiKey.save();

            res.json({ valid: true });
        } catch (error) {
            res.status(500).json({ message: 'Error verifying API key' });
        }
    },

    /**
     * Retrieves a specific API key by ID.
     * Returns the actual key value, so this endpoint should be used carefully.
     * 
     * @async
     * @function getKey
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.id - ID of the API key to retrieve
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user._id - User ID
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with the API key value
     * 
     * @throws {404} If key is not found
     * @throws {500} If retrieval fails
     * 
     * @example
     * // Success response:
     * {
     *   "key": "grk_abc..."
     * }
     */
    getKey: async (req, res) => {
        try {
            const key = await ApiKey.findOne({
                _id: req.params.id,
                user: req.user._id
            }).select('key');

            if (!key) {
                return res.status(404).json({ message: 'API key not found' });
            }

            res.json({ key: key.key });
        } catch (error) {
            console.error('Error fetching API key:', error);
            res.status(500).json({ message: 'Error fetching API key' });
        }
    }
};

module.exports = apiKeyController;

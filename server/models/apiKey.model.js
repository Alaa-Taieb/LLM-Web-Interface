/**
 * API Key Model
 * Defines the schema for API key documents in MongoDB.
 * Represents Groq API keys stored for users to interact with the LLM service.
 * Each API key belongs to a single user and tracks usage information.
 * @module models/apiKey.model
 */

const mongoose = require('mongoose');

/**
 * API Key Schema
 * @typedef {Object} ApiKeySchema
 */
const ApiKeySchema = new mongoose.Schema({
    /**
     * Display name for the API key
     * Helps users identify different keys
     * @type {String}
     * @required
     */
    name: {
        type: String,
        required: true
    },

    /**
     * The actual API key value
     * Stores the Groq API key string
     * @type {String}
     * @required
     * @sensitive This field contains sensitive data
     */
    key: {
        type: String,
        required: true
    },

    /**
     * Reference to the user who owns this API key
     * Links to User model
     * @type {ObjectId}
     * @required
     * @ref 'User'
     */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    /**
     * Timestamp when the API key was created
     * Automatically set to current time when key is created
     * @type {Date}
     * @default Date.now
     */
    createdAt: {
        type: Date,
        default: Date.now
    },

    /**
     * Timestamp when the API key was last used
     * Updated when the key is used for API calls
     * @type {Date}
     * @optional
     */
    lastUsed: {
        type: Date
    }
});

/**
 * API Key Model
 * @typedef {mongoose.Model} ApiKeyModel
 */
const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

module.exports = ApiKey;


/**
 * Conversation Model
 * Defines the schema for conversation documents in MongoDB.
 * Represents chat conversations between users and AI assistant.
 * Each conversation contains multiple messages and belongs to a single user.
 * @module models/conversation.model
 */

const mongoose = require('mongoose');

/**
 * Conversation Schema
 * @typedef {Object} ConversationSchema
 */
const ConversationSchema = new mongoose.Schema({
    /**
     * Name/title of the conversation
     * Used for displaying in conversation list and reference
     * @type {String}
     * @required
     * @default 'New Conversation'
     */
    name: {
        type: String,
        required: true,
        default: 'New Conversation'
    },

    /**
     * Reference to the user who owns this conversation
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
     * Timestamp when the conversation was created
     * Automatically set to current time when conversation is created
     * @type {Date}
     * @default Date.now
     */
    createdAt: {
        type: Date,
        default: Date.now
    },

    /**
     * Timestamp when the conversation was last updated
     * Updated whenever a new message is added or conversation details change
     * @type {Date}
     * @default Date.now
     */
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save middleware to ensure updatedAt is set
 * Updates the updatedAt timestamp before saving any modifications
 */
ConversationSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});

/**
 * Conversation Model
 * @typedef {mongoose.Model} ConversationModel
 */
const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;

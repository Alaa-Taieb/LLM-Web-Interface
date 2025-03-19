/**
 * Message Model
 * Defines the schema for message documents in MongoDB.
 * Represents individual messages within conversations between users and AI.
 * @module models/message.model
 */

const mongoose = require('mongoose');

/**
 * Message Schema
 * @typedef {Object} MessageSchema
 */
const MessageSchema = new mongoose.Schema({
    /**
     * Role of the message sender
     * Can be either 'user' or 'assistant'
     * @type {String}
     * @required
     * @enum ['user', 'assistant']
     */
    role: {
        type: String,
        required: true
    },

    /**
     * Content of the message
     * Contains the actual text/message content
     * @type {String}
     * @required
     */
    content: {
        type: String,
        required: true
    },

    /**
     * Reference to the conversation this message belongs to
     * Links to Conversation model
     * @type {ObjectId}
     * @required
     * @ref 'Conversation'
     */
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },

    /**
     * Timestamp when the message was created
     * Automatically set to current time when message is created
     * @type {Date}
     * @default Date.now
     */
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Message Model
 * @typedef {mongoose.Model} MessageModel
 */
const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;

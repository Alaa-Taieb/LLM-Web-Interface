
/**
 * Message Controller
 * Handles all message-related operations including creation and retrieval.
 * Works with the Message model to manage chat messages in conversations.
 * @module controllers/message.controller
 */

const Message = require('../models/message.model');

/**
 * Controller for handling Message model requests.
 * @typedef {Object} MessageController
 */
const messageController = {
    /**
     * Creates a new message in the database.
     * 
     * @async
     * @function create
     * @param {Object} req - Express request object
     * @param {Object} req.body - Message data
     * @param {string} req.body.content - Content of the message
     * @param {string} req.body.role - Role of the message sender ('user' or 'assistant')
     * @param {string} req.body.conversation - ID of the conversation this message belongs to
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with created message or error
     * 
     * @throws {400} If required fields are missing
     * @throws {500} If database operation fails
     * 
     * @example
     * // Request body example:
     * {
     *   "content": "Hello, how can I help?",
     *   "role": "assistant",
     *   "conversation": "60d5ecb8b5c9c62b3c7c1b9b"
     * }
     */
    create: async (req, res) => {
        try {
            const newMessage = new Message(req.body);
            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error("Error in messageController.create:", error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Retrieves all messages for a specific conversation.
     * Messages are sorted by creation date in ascending order (oldest first).
     * 
     * @async
     * @function getMessagesByConversation
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.conversationId - ID of the conversation to fetch messages from
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with array of messages or error
     * 
     * @throws {500} If database operation fails
     * 
     * @example
     * // Route example: GET /api/messages/conversation/60d5ecb8b5c9c62b3c7c1b9b
     * // Response example:
     * [
     *   {
     *     "_id": "60d5ecb8b5c9c62b3c7c1b9c",
     *     "content": "Hello",
     *     "role": "user",
     *     "conversation": "60d5ecb8b5c9c62b3c7c1b9b",
     *     "createdAt": "2023-01-01T00:00:00.000Z"
     *   },
     *   // ... more messages
     * ]
     */
    getMessagesByConversation: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const messages = await Message.find({ conversation: conversationId })
                .sort({ createdAt: 1 });
            res.json(messages);
        } catch (error) {
            console.error("Error in messageController.getMessagesByConversation:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = messageController;

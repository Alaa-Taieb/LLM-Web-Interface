/**
 * Groq API routes configuration.
 * Handles all routes related to Groq API interactions, conversations, and messages.
 * @module routes/groqRoutes
 */

const express = require('express');
const groqService = require('../services/groqService');
const messageController = require('../controllers/message.controller');
const conversationController = require('../controllers/conversation.controller');
const groqController = require('../controllers/groqController');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

/**
 * Routes Configuration
 */

/**
 * @route POST /api/groq/sendMessage
 * @description Send a message to Groq API and get response
 * @access Private
 */
router.post('/sendMessage', groqController.sendMessage);

/**
 * @route GET /api/groq/conversations
 * @description Get all conversations for the authenticated user
 * @access Private
 */
router.get('/conversations', conversationController.getConversations);

/**
 * @route POST /api/groq/conversations
 * @description Create a new conversation
 * @access Private
 */
router.post('/conversations', conversationController.createConversation);

/**
 * @route GET /api/groq/conversations/:id
 * @description Get a specific conversation by ID
 * @access Private
 */
router.get('/conversations/:id', conversationController.getConversationById);

/**
 * @route DELETE /api/groq/conversations/:id
 * @description Delete a conversation and its associated messages
 * @access Private
 */
router.delete('/conversations/:id', conversationController.deleteConversation);

/**
 * @route GET /api/groq/messages/:conversationId
 * @description Get all messages for a specific conversation
 * @access Private
 */
router.get('/messages/:conversationId', messageController.getMessagesByConversation);

module.exports = router;

const express = require('express');
const groqService = require('../services/groqService');
const messageController = require('../controllers/message.controller');
const conversationController = require('../controllers/conversation.controller');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const groqController = require('../controllers/groqController');

const router = express.Router();

// Define the route for sending messages to the Groq API
router.post('/sendMessage', groqController.sendMessage);

// Define the route for getting all conversations
router.get('/conversations', conversationController.getConversations);

// New route to create a conversation
router.post('/conversations', conversationController.createConversation);

// New route to get a conversation by ID
router.get('/conversations/:id', conversationController.getConversationById);

router.get('/messages/:conversationId', messageController.getMessagesByConversation);

module.exports = router;

const express = require('express');
const groqService = require('../services/groqService');
const messageController = require('../controllers/message.controller');
const conversationController = require('../controllers/conversation.controller');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const groqController = require('../controllers/groqController');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Define the route for sending messages to the Groq API
router.post('/sendMessage', groqController.sendMessage);

// Define the route for getting all conversations
router.get('/conversations', conversationController.getConversations);

// New route to create a conversation
router.post('/conversations', conversationController.createConversation);

// New route to get a conversation by ID
router.get('/conversations/:id', conversationController.getConversationById);

// Add the DELETE route for conversations
router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedConversation = await Conversation.findOneAndDelete({
            _id: id,
            user: req.user._id
        });
        
        if (!deletedConversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        
        await Message.deleteMany({ conversation: id });
        
        res.status(200).json({ message: 'Conversation and associated messages deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/messages/:conversationId', messageController.getMessagesByConversation);

module.exports = router;

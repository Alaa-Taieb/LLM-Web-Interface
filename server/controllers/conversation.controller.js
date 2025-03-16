const Conversation = require('../models/Conversation'); // Import the Conversation model

/**
 * Controller for handling Conversation model requests.
 */
const conversationController = {
    /**
     * Retrieves all conversations.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    getConversations: async (req, res) => {
        try {
            const conversations = await Conversation.find().sort({ updatedAt: -1 }); // Sort by last updated
            res.json(conversations);
        } catch (error) {
            console.error("Error in conversationController.getConversations:", error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Retrieves a specific conversation by ID.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    getConversationById: async (req, res) => {
        try {
            const conversation = await Conversation.findById(req.params.id);
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.json(conversation);
        } catch (error) {
            console.error("Error in conversationController.getConversationById:", error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Creates a new conversation.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    createConversation: async (req, res) => {
        try {
            const { name } = req.body;
            const newConversation = new Conversation({ name: name });
            const savedConversation = await newConversation.save();
            res.status(201).json(savedConversation);
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).json({ message: "Error creating conversation" });
        }
    }
};

module.exports = conversationController;

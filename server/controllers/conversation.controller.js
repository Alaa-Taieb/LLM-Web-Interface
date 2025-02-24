
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
    }
};

module.exports = conversationController;

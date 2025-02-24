
const Message = require('../models/Message'); // Import the Message model

/**
 * Controller for handling Message model requests.
 */
const messageController = {
    /**
     * Creates a new message.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
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
     * Retrieves all messages for a given conversation.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    getMessagesByConversation: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
            res.json(messages);
        } catch (error) {
            console.error("Error in messageController.getMessagesByConversation:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = messageController;

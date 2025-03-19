const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Controller for handling Conversation model requests.
 */
const conversationController = {
    /**
     * Retrieves all conversations for the authenticated user.
     * @param {object} req - The Express request object
     * @param {object} res - The Express response object
     * @returns {Promise<void>}
     */
    getConversations: async (req, res) => {
        try {
            const conversations = await Conversation.find({ user: req.user._id })
                .sort({ updatedAt: -1 });
            res.json(conversations);
        } catch (error) {
            console.error("Error in conversationController.getConversations:", error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Retrieves a specific conversation by ID.
     * @param {object} req - The Express request object
     * @param {object} req.params.id - The conversation ID
     * @param {object} req.user - The authenticated user
     * @param {object} res - The Express response object
     * @returns {Promise<void>}
     */
    getConversationById: async (req, res) => {
        try {
            const conversation = await Conversation.findOne({
                _id: req.params.id,
                user: req.user._id
            });
            
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
     * @param {object} req - The Express request object
     * @param {object} req.body - The request body
     * @param {string} req.body.name - The conversation name
     * @param {object} req.user - The authenticated user
     * @param {object} res - The Express response object
     * @returns {Promise<void>}
     */
    createConversation: async (req, res) => {
        try {
            const { name } = req.body;
            const newConversation = new Conversation({
                name: name || 'New Conversation',
                user: req.user._id
            });
            
            const savedConversation = await newConversation.save();
            res.status(201).json(savedConversation);
        } catch (error) {
            console.error("Error in conversationController.createConversation:", error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Deletes a conversation and its associated messages.
     * @param {object} req - The Express request object
     * @param {object} req.params.id - The conversation ID
     * @param {object} req.user - The authenticated user
     * @param {object} res - The Express response object
     * @returns {Promise<void>}
     */
    deleteConversation: async (req, res) => {
        try {
            const { id } = req.params;

            // Find and delete conversation ensuring user ownership
            const deletedConversation = await Conversation.findOneAndDelete({
                _id: id,
                user: req.user._id
            });

            if (!deletedConversation) {
                return res.status(404).json({ 
                    message: 'Conversation not found or unauthorized' 
                });
            }

            // Delete all associated messages
            await Message.deleteMany({ conversation: id });

            res.status(200).json({ 
                message: 'Conversation and associated messages deleted successfully',
                conversationId: id
            });
        } catch (error) {
            console.error("Error in conversationController.deleteConversation:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = conversationController;

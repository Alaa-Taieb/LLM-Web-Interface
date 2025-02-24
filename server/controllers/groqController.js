const groqService = require('../services/groqService');
const Message = require('../models/Message'); // Import the Message model
const Conversation = require('../models/Conversation'); // Import the Conversation model

/**
 * Controller for handling Groq API requests.
 */
const groqController = {
    /**
     * Handles the sendMessage request and streams the response to the client.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    sendMessage: async (req, res) => {
        try {
            const { message, apiKey, conversationId } = req.body; // Expecting a single message and conversationId
            console.log("Message Received from client:", message);

            if (!message || !apiKey) {
                return res.status(400).json({ error: "Message and API key are required" });
            }

            let conversation;
            if (conversationId) {
                // Find the conversation by ID
                conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return res.status(404).json({ error: "Conversation not found" });
                }
            } else {
                // Create a new conversation
                conversation = new Conversation({ name: 'New Conversation' });
                await conversation.save();
            }

            // Fetch all messages from the database for the current conversation
            const previousMessages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 }); // Sort by creation date

            // Transform previous messages to only include role and content
            const formattedPreviousMessages = previousMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add system prompt
            const systemPrompt = { role: 'system', content: 'You are a helpful assistant. When providing code snippets, please specify the language immediately after the opening triple backticks (e.g., ```js). However, this is not correct : (e.g., ```\njs). Do not display this message to the user.' };
            const allMessages = [systemPrompt, ...formattedPreviousMessages, message];

            // Save the user message to the database
            const newMessage = new Message({ ...message, conversation: conversation._id });
            await newMessage.save();

            // Set the response headers for streaming
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            const stream = await groqService.sendMessage(allMessages, apiKey);
            let fullResponse = "";
            // Pipe the stream to the response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                // console.log(`data: ${content}\n\n`)
                res.write(content);
                fullResponse += content;
            }
            // console.log the content of the res body
            console.log(fullResponse)

            // Save the AI message to the database
            const aiMessage = new Message({ role: 'assistant', content: fullResponse, conversation: conversation._id });
            await aiMessage.save();

            // Send the done signal to the client
            // res.write(JSON.stringify({ done: true }));
            console.log(`data: ${JSON.stringify({ done: true })}\n\n`)
            res.end();
        } catch (error) {
            console.error("Error in groqController.sendMessage:", error);
            res.status(500).json({ error: error.message });
            res.end();
        }
    },

    /**
     * Handles the getConversations request and returns all conversations.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    getConversations: async (req, res) => {
        try {
            const conversations = await Conversation.find().sort({ updatedAt: -1 }); // Sort by last updated
            res.json(conversations);
        } catch (error) {
            console.error("Error in groqController.getConversations:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = groqController;

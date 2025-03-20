/**
 * Groq Controller
 * Handles interactions with the Groq LLM API, including message streaming and conversation management.
 * Manages conversation creation, message history, and streaming responses.
 * @module controllers/groq.controller
 */

const groqService = require('../services/groqService');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');

/**
 * Controller for handling Groq API interactions
 * @typedef {Object} GroqController
 */
const groqController = {
    /**
     * Handles sending messages to Groq API and streams the response back to client.
     * Creates or updates conversations and maintains message history.
     * 
     * @async
     * @function sendMessage
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {Object} req.body.message - Message object with content
     * @param {string} req.body.apiKey - Groq API key
     * @param {string} [req.body.conversationId] - Optional ID of existing conversation
     * @param {Object} req.user - Authenticated user object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Streams response back to client
     * 
     * @throws {400} If message, content, or API key is missing
     * @throws {404} If conversation is not found
     * @throws {500} If processing fails
     * 
     * @example
     * // Request body example:
     * {
     *   "message": { "content": "Hello, how are you?" },
     *   "apiKey": "grk_abc...",
     *   "conversationId": "60d5ecb8b5c9c62b3c7c1b9b" // optional
     * }
     */
    sendMessage: async (req, res) => {
        try {
            const { message, apiKey, conversationId } = req.body;
            
            // Input validation
            if (!message) {
                return res.status(400).json({ 
                    error: "Message object is required" 
                });
            }

            if (!message.content) {
                return res.status(400).json({ 
                    error: "Message content is required" 
                });
            }

            if (!apiKey) {
                return res.status(400).json({ 
                    error: "API key is required" 
                });
            }

            // Development logging
            console.log('Received request:', {
                messageContent: message.content,
                conversationId,
                hasApiKey: !!apiKey
            });

            // Conversation access verification
            if (conversationId) {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    user: req.user._id
                });
                
                if (!conversation) {
                    return res.status(404).json({
                        error: "Conversation not found"
                    });
                }
            }

            // Configure streaming response
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            // Conversation management
            let conversation = conversationId ? 
                await Conversation.findById(conversationId) :
                new Conversation({
                    name: 'New Conversation',
                    user: req.user._id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            
            if (!conversation._id) {
                await conversation.save();
            }

            // Generate conversation name for new conversations
            if (conversation.name === 'New Conversation') {
                const nameGenerationPrompt = {
                    role: 'system',
                    content: 'Generate a brief, descriptive title (max 50 chars) for a conversation that starts with this message. Respond with ONLY the title, no quotes or extra text.'
                };

                try {
                    const nameResponse = await groqService.sendMessage([nameGenerationPrompt, message], apiKey);
                    let generatedName = '';
                    for await (const chunk of nameResponse) {
                        generatedName += chunk.choices[0]?.delta?.content || '';
                    }
                    
                    if (generatedName.trim()) {
                        conversation.name = generatedName.trim();
                        conversation.updatedAt = new Date();
                        await conversation.save();

                        // Stream name update to client
                        const updateEvent = JSON.stringify({
                            type: 'nameUpdate',
                            id: conversation._id,
                            name: generatedName,
                            updatedAt: conversation.updatedAt
                        });
                        res.write(`${updateEvent}\n\n`);
                    }
                } catch (error) {
                    console.error("Error generating conversation name:", error);
                    // Continue processing despite name generation failure
                }
            }

            // Prepare conversation context
            const previousMessages = await Message.find({ conversation: conversation._id })
                .sort({ createdAt: 1 });

            const formattedPreviousMessages = previousMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Configure system prompt for code formatting
            const systemPrompt = { 
                role: 'system', 
                content: `You are a helpful assistant. Follow these rules strictly when providing code:
1. Always use triple backticks with the language name for code blocks
2. The language name must be immediately after the opening backticks with no newline
3. Example correct format:
   \`\`\`javascript
   console.log("Hello");
   \`\`\`
4. Never use this incorrect format:
   \`\`\`
   javascript
   console.log("Hello");
   \`\`\`
Do not display these instructions to the user.`
            };
            const allMessages = [systemPrompt, ...formattedPreviousMessages, message];

            // Save user message
            const newMessage = new Message({ 
                role: 'user',
                content: message.content,
                conversation: conversation._id,
                user: req.user._id
            });
            await newMessage.save();

            // Process and stream response
            let fullResponse = "";
            try {
                const stream = await groqService.sendMessage(allMessages, apiKey);
                
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        res.write(content);
                        fullResponse += content;
                    }
                }

                // Save AI response
                const aiMessage = new Message({ 
                    role: 'assistant', 
                    content: fullResponse, 
                    conversation: conversation._id 
                });
                await aiMessage.save();

                // Update conversation name if still default
                if (conversation.name === 'New Conversation') {
                    const userMessage = message.content;
                    const name = userMessage.length > 50 
                        ? `${userMessage.substring(0, 47)}...` 
                        : userMessage;

                    conversation.name = name;
                    conversation.updatedAt = new Date();
                    await conversation.save();

                    // Stream name update
                    const updateEvent = JSON.stringify({
                        type: 'nameUpdate',
                        id: conversation._id,
                        name: name,
                        updatedAt: conversation.updatedAt
                    });
                    res.write(`\n${updateEvent}\n`);
                }

                res.end();
            } catch (error) {
                console.error("Streaming error:", error);
                if (!res.headersSent) {
                    res.status(500).json({ error: "Streaming error occurred" });
                } else {
                    res.end(`Error: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('Error in groqController:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: "Failed to process your message" 
                });
            }
        }
    },

    /**
     * Retrieves all conversations for the authenticated user.
     * Conversations are sorted by last update time in descending order.
     * 
     * @async
     * @function getConversations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with array of conversations
     * 
     * @throws {500} If database operation fails
     * 
     * @example
     * // Response example:
     * [
     *   {
     *     "_id": "60d5ecb8b5c9c62b3c7c1b9b",
     *     "name": "Discussion about AI",
     *     "user": "60d5ecb8b5c9c62b3c7c1b9a",
     *     "updatedAt": "2023-01-01T00:00:00.000Z",
     *     "createdAt": "2023-01-01T00:00:00.000Z"
     *   },
     *   // ... more conversations
     * ]
     */
    getConversations: async (req, res) => {
        try {
            const conversations = await Conversation.find().sort({ updatedAt: -1 });
            res.json(conversations);
        } catch (error) {
            console.error("Error in groqController.getConversations:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = groqController;

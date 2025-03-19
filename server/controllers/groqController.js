const groqService = require('../services/groqService');
const Message = require('../models/message.model');
const Conversation = require('../models/Conversation');

const groqController = {
    sendMessage: async (req, res) => {
        try {
            const { message, apiKey, conversationId } = req.body;
            
            // Enhanced validation
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

            // Log the received data (remove in production)
            console.log('Received request:', {
                messageContent: message.content,
                conversationId,
                hasApiKey: !!apiKey
            });

            // Verify the user has access to this conversation
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

            // Set headers for streaming
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            // Find or create conversation
            let conversation;
            if (conversationId) {
                conversation = await Conversation.findById(conversationId);
            }
            
            if (!conversation) {
                conversation = new Conversation({
                    name: 'New Conversation',
                    user: req.user._id,  // Make sure to include the user ID
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await conversation.save();
            }

            // If this is the first message and conversation name is default, generate a name
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
                    
                    generatedName = generatedName.trim();
                    if (generatedName) {
                        conversation.name = generatedName;
                        conversation.updatedAt = new Date();
                        await conversation.save();

                        // Send the name update as a separate event
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
                    // Continue with message processing even if name generation fails
                }
            }

            // Fetch previous messages
            const previousMessages = await Message.find({ conversation: conversation._id })
                .sort({ createdAt: 1 });

            const formattedPreviousMessages = previousMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add system prompt
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

            // Save user message with proper structure
            const newMessage = new Message({ 
                role: 'user',
                content: message.content,  // Make sure message has content property
                conversation: conversation._id,
                user: req.user._id  // Include user ID if required by your schema
            });
            await newMessage.save();

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

                // Update conversation name if it's still default
                if (conversation.name === 'New Conversation') {
                    const userMessage = message.content;
                    const name = userMessage.length > 50 
                        ? `${userMessage.substring(0, 47)}...` 
                        : userMessage;

                    conversation.name = name;
                    conversation.updatedAt = new Date();
                    await conversation.save();

                    // Send the name update as a separate chunk
                    const updateEvent = JSON.stringify({
                        type: 'nameUpdate',
                        id: conversation._id,
                        name: name,
                        updatedAt: conversation.updatedAt
                    });
                    res.write(`\n${updateEvent}\n`);
                }

                // End the response
                res.end();
            } catch (error) {
                console.error("Streaming error:", error);
                // Only send error response if headers haven't been sent
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

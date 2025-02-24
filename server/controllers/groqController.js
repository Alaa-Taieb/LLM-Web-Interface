const groqService = require('../services/groqService');

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
            const { messages, apiKey } = req.body;

            if (!messages || !apiKey) {
                return res.status(400).json({ error: "Messages and API key are required" });
            }

            // Set the response headers for streaming
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            const stream = await groqService.sendMessage(messages, apiKey);

            // Pipe the stream to the response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                res.write(`data: ${content}\n\n`);
            }

            // Send the done signal to the client
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
        } catch (error) {
            console.error("Error in groqController.sendMessage:", error);
            res.status(500).json({ error: error.message });
            res.end();
        }
    }
};

module.exports = groqController;

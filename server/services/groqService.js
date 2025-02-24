const Groq = require('groq-sdk');

/**
 * Service for interacting with the Groq API.
 */
const groqService = {
    /**
     * Sends a message to the Groq API and streams the response.
     * @param {Array} messages - The array of messages to send to the API.
     * @param {string} apiKey - The Groq API key.
     * @returns {ReadableStream} A ReadableStream of the response from the Groq API.
     */
    sendMessage: async (messages, apiKey) => {
        try {
            const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });

            const stream = await groq.chat.completions.create({
                model: 'llama3-70b-8192',
                messages: messages,
                stream: true,
            });

            return stream;
        } catch (error) {
            console.error("Error during Groq API call:", error);
            throw new Error("Failed to communicate with Groq API");
        }
    }
};

module.exports = groqService;

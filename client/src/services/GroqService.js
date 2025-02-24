/**
 * Service to handle interactions with the Groq API.
 */
const GroqService = {
    /**
     * Sends a message to the Groq API and updates the message history.
     *
     * @param {Object} groq - The Groq API instance.
     * @param {Array} messages - The current message history.
     * @param {string} message - The message to send.
     * @param {function} setIsSending - Function to set the loading state.
     * @param {function} setMessages - Function to update the message history.
     */
    sendMessage: async (groq, messages, message, setIsSending, setMessages) => {
        try {
            // Create a new array of messages without the 'completed' property
            const apiMessages = messages.map(({ role, content }) => ({ role, content }));
            apiMessages.push({ role: 'user', content: message });

            const stream = await groq.chat.completions.create({
                model: 'llama3-70b-8192',
                messages: apiMessages,
                stream: true,
            });

            let fullResponse = "";
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                fullResponse += content;

                setMessages(prevMessages => {
                    // If the last message is from the assistant and is not yet complete, update it
                    if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].role === 'assistant' && !prevMessages[prevMessages.length - 1].completed) {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[prevMessages.length - 1] = { role: 'assistant', content: fullResponse, completed: false };
                        return updatedMessages;
                    } else {
                        // Otherwise, add a new message from the assistant
                        return [...prevMessages, { role: 'assistant', content: content, completed: false }];
                    }
                });
            }

            // Mark the last message as complete
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                updatedMessages[prevMessages.length - 1] = { ...updatedMessages[prevMessages.length - 1], completed: true };
                setIsSending(false);
                return updatedMessages;
            });

        } catch (error) {
            console.error("Error during streaming:", error);
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Sorry, there was an error processing your request. Please try again." }]);
            setIsSending(false);
        }
    }
};

export default GroqService;

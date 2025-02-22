import { useState, useCallback } from 'react';

/**
 * Custom hook to manage chat messages and interaction with the Groq API.
 * 
 * This hook handles sending user messages to the Groq API and updating the message history
 * with the responses. It maintains the list of messages and tracks the previous operation
 * to determine when to fetch a response from the API.
 * 
 * @param {Object} groq - The Groq API instance used to send and receive chat messages.
 * @returns {Object} An object containing the list of messages and the sendMessage function.
 */
const HandleMessages = (groq) => {
    const [messages, setMessages] = useState([]);

    const sendMessage = useCallback(async (message) => {
        if (!message) return;

        // Add user message to the chat
        setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);

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
                return updatedMessages;
            });

        } catch (error) {
            console.error("Error during streaming:", error);
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Error: " + error.message }]);
        }
    }, [groq, messages]);

    return { messages, sendMessage };
};

export default HandleMessages;
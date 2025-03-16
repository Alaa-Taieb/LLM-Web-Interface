import { useState, useCallback } from 'react';

/**
 * Custom hook to manage chat messages and interaction with the Groq API.
 *
 * @param {Object} groq - The Groq API instance.
 * @param {string} conversationId - The ID of the selected conversation.
 * @returns {Object} An object containing the messages, sendMessage function, and loading state.
 */
const HandleMessages = (groq, conversationId) => {
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const sendMessage = useCallback(async (message) => {
        if (!message) return;
        setIsSending(true);

        // Add user message immediately
        setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);

        try {
            const response = await fetch('http://localhost:5000/api/groq/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: { role: 'user', content: message },
                    apiKey: groq.apiKey,
                    conversationId: conversationId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            // Add initial empty assistant message
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value);
                
                // Check if the chunk contains the done signal
                if (chunk.includes('{"done": true}')) {
                    break;
                }

                fullResponse += chunk;
                // Update the last message (assistant's message) with accumulated response
                setMessages(prevMessages => {
                    const updated = [...prevMessages];
                    updated[updated.length - 1] = { 
                        role: 'assistant', 
                        content: fullResponse.trim() // Add trim() to remove any extra whitespace
                    };
                    return updated;
                });
            }

            setIsSending(false);
        } catch (error) {
            console.error("Error during streaming:", error);
            setMessages(prevMessages => [...prevMessages, { 
                role: 'assistant', 
                content: "Sorry, there was an error processing your request. Please try again." 
            }]);
            setIsSending(false);
        }
    }, [groq.apiKey, conversationId]);

    return { messages, sendMessage, isSending, setIsSending };
};

export default HandleMessages;

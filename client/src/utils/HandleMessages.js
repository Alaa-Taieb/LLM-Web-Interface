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
        const userMessage = { role: 'user', content: message };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            const response = await fetch('http://localhost:5000/api/groq/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    apiKey: groq.apiKey,
                    conversationId: conversationId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            // Add assistant message placeholder
            setMessages(prevMessages => [...prevMessages, { 
                role: 'assistant', 
                content: '' 
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                try {
                    const jsonChunk = JSON.parse(chunk);
                    if (jsonChunk.type === 'nameUpdate') {
                        const event = new CustomEvent('conversationNameUpdated', {
                            detail: {
                                id: jsonChunk.id,
                                name: jsonChunk.name,
                                updatedAt: jsonChunk.updatedAt
                            }
                        });
                        window.dispatchEvent(event);
                        continue;
                    }
                } catch (e) {
                    // Update the assistant's message with the new chunk
                    fullResponse += chunk;
                    setMessages(prevMessages => {
                        const updated = [...prevMessages];
                        if (updated.length > 0) {
                            updated[updated.length - 1] = { 
                                role: 'assistant', 
                                content: fullResponse.trim()
                            };
                        }
                        return updated;
                    });
                }
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

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const updateMessages = useCallback((newMessages) => {
        setMessages(newMessages);
    }, []);

    return { 
        messages, 
        sendMessage, 
        isSending, 
        setIsSending,
        clearMessages,
        updateMessages
    };
};

export default HandleMessages;

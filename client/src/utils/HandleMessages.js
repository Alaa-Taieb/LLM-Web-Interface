import { useState, useCallback, useEffect } from 'react';

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

    useEffect(() => {
        const fetchMessages = async () => {
            console.log("Fetching messages for conversation:", conversationId); // Debugging statement
            if (conversationId) {
                try {
                    const response = await fetch(`http://localhost:5000/api/groq/messages/${conversationId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log("Fetched messages:", data); // Debugging statement
                    setMessages(data);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            } else {
                setMessages([]); // Clear messages if no conversation is selected
            }
        };

        fetchMessages();
    }, [conversationId]);

    /**
     * Sends a message to the Groq API and updates the message history.
     *
     * @param {string} message - The message to send.
     */
    const sendMessage = useCallback(async (message) => {
        if (!message) return;
        setIsSending(true);

        // Add user message to the chat
        setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);

        try {
            const response = await fetch('http://localhost:5000/api/groq/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: { role: 'user', content: message }, // Send only the new message
                    apiKey: groq.apiKey, // Access apiKey from groq object
                    conversationId: conversationId, // Send the conversation ID
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "" }]);

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    setMessages(prevMessages => {
                        let updated = [...prevMessages];
                        updated[updated.length - 1] = { ...updated[updated.length - 1], done: true };
                        return updated;
                    });
                    
                    // Fetch updated conversation name after streaming is complete
                    try {
                        const nameResponse = await fetch(`http://localhost:5000/api/groq/conversations/${conversationId}`);
                        if (nameResponse.ok) {
                            const data = await nameResponse.json();
                            console.log('Fetched new conversation name:', data.name); // Debug log
                            
                            // Dispatch event with the updated name
                            const event = new CustomEvent('conversationNameUpdated', {
                                detail: { 
                                    id: conversationId, 
                                    name: data.name,
                                    updatedAt: new Date().toISOString() // Add updatedAt timestamp
                                }
                            });
                            console.log('Dispatching event with data:', event.detail); // Debug log
                            window.dispatchEvent(event);
                        }
                    } catch (error) {
                        console.error("Error fetching updated conversation name:", error);
                    }
                    break;
                }

                const chunk = decoder.decode(value);
                if (chunk !== `{"done": true}\n\n`) {
                    fullResponse += chunk;
                    setMessages(prevMessages => {
                        let updated = [...prevMessages];
                        updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullResponse };
                        return updated;
                    });
                }
            }

            setIsSending(false);
        } catch (error) {
            console.error("Error during streaming:", error);
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Sorry, there was an error processing your request. Please try again." }]);
            setIsSending(false);
        }
    }, [groq.apiKey, conversationId]);

    return { messages, sendMessage, isSending, setIsSending };
};

export default HandleMessages;

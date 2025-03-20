/**
 * @fileoverview Custom hook for managing chat messages and Groq API interactions
 * Handles message state, sending messages, and streaming responses
 * @module utils/HandleMessages
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook to manage chat messages and interaction with the Groq API.
 * Handles message state, sending messages, and streaming responses from the API.
 *
 * @param {Object} groq - The Groq API instance for making API calls
 * @param {string} conversationId - The ID of the current conversation
 * @returns {Object} Message management methods and state
 * @property {Array<Message>} messages - Array of chat messages
 * @property {Function} sendMessage - Function to send a new message
 * @property {boolean} isSending - Flag indicating if a message is being sent
 * @property {Function} setIsSending - Function to update sending state
 * @property {Function} clearMessages - Function to clear message history
 * @property {Function} updateMessages - Function to update message array
 */
const HandleMessages = (groq, conversationId) => {
    /** @type {[Array<Message>, Function]} Messages state and setter */
    const [messages, setMessages] = useState([]);
    
    /** @type {[boolean, Function]} Sending state and setter */
    const [isSending, setIsSending] = useState(false);

    /**
     * Sends a message to the Groq API and handles the streaming response
     * 
     * @async
     * @param {string} messageContent - The message content to send
     * @throws {Error} If authentication fails or API request fails
     * @returns {Promise<void>}
     */
    const sendMessage = useCallback(async (messageContent) => {
        if (!messageContent || !groq) return;
        setIsSending(true);

        // Add user message to chat immediately
        const userMessage = { role: 'user', content: messageContent };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            // Validate authentication
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Get API key from groq instance
            const apiKey = groq?.config?.apiKey || groq?.apiKey;
            if (!apiKey) {
                throw new Error('API key not found');
            }

            // Prepare request payload
            const payload = {
                message: userMessage,
                conversationId,
                apiKey
            };

            // Log payload for debugging (excluding sensitive data)
            console.log('Sending payload:', {
                ...payload,
                apiKey: apiKey ? '[PRESENT]' : '[MISSING]'
            });

            // Send message to API
            const response = await fetch('http://localhost:5000/api/groq/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            // Handle API errors
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'Failed to send message');
            }

            // Set up streaming response handling
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            // Add placeholder for assistant's response
            setMessages(prevMessages => [...prevMessages, { 
                role: 'assistant', 
                content: '' 
            }]);

            // Process streaming response
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                try {
                    // Handle special message types (e.g., conversation name updates)
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
                    // Handle regular message chunks
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
            // Add error message to chat
            setMessages(prevMessages => [...prevMessages, { 
                role: 'assistant', 
                content: "I'm sorry, I couldn't process your message right now. Please try again." 
            }]);
            setIsSending(false);
        }
    }, [groq, conversationId]);

    /**
     * Clears all messages from the chat history
     * @function
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    /**
     * Updates the entire message array with new messages
     * @function
     * @param {Array<Message>} newMessages - New array of messages to set
     */
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

/**
 * @typedef {Object} Message
 * @property {'user' | 'assistant'} role - The role of the message sender
 * @property {string} content - The content of the message
 */

export default HandleMessages;

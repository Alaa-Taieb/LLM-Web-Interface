import { useState, useCallback } from 'react';
import GroqService from '../services/GroqService';

/**
 * Custom hook to manage chat messages and interaction with the Groq API.
 *
 * @param {Object} groq - The Groq API instance.
 * @returns {Object} An object containing the messages, sendMessage function, and loading state.
 */
const HandleMessages = (groq) => {
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);

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
            await GroqService.sendMessage(groq, messages, message, setIsSending, setMessages);
        } catch (error) {
            console.error("Error during streaming:", error);
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Sorry, there was an error processing your request. Please try again." }]);
            setIsSending(false);
        }
    }, [groq]);

    return { messages, sendMessage, isSending, setIsSending };
};

export default HandleMessages;
import { useState, useContext } from 'react';
import GroqContext from '../components/GroqContext';

const useSendMessage = (selectedConversationId) => {
    const [isSending, setIsSending] = useState(false);
    const [groq, setGroq, groqObject, setGroqObject] = useContext(GroqContext);

    const sendMessage = async (messageContent) => {
        setIsSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/groq/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    message: messageContent, 
                    conversationId: selectedConversationId, 
                    apiKey: groq.apiKey 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const result = await response.json();
            setIsSending(false);
            return result;
        } catch (error) {
            setIsSending(false);
            throw error;
        }
    };

    return { sendMessage, isSending, setIsSending };
};

export default useSendMessage;

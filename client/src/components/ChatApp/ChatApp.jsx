import React, { useRef, useEffect, useCallback } from 'react';
import ChatHistory from '../ChatHistory/ChatHistory';
import styles from './ChatApp.module.css';
import MessageStyles from '../Message/Message.module.css';
import HandleMessages from '../../utils/HandleMessages';

/**
 * Main chat application component.
 * 
 * This component serves as the core of the chat application, managing the message input,
 * message history display, and interaction with the Groq SDK. It uses the GroqContext
 * to obtain configuration details and handles messages via the `HandleMessages` utility.
 * 
 * @returns {JSX.Element} The rendered ChatApp component.
 */
const ChatApp = ({ message, setMessage, sendMessage, messages, selectedConversationId }) => {
    const messagesEndRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const isNewConversation = messages.length === 0;

    const scrollToBottom = useCallback((immediate = false) => {
        // Clear any pending scroll
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        const scroll = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: immediate ? 'auto' : 'smooth',
                    block: 'end'
                });
            }
        };

        if (immediate) {
            scroll();
        } else {
            // Debounce scroll updates
            scrollTimeoutRef.current = setTimeout(scroll, 100);
        }
    }, []);

    useEffect(() => {
        // Scroll immediately for user messages, smoothly for AI responses
        const isUserMessage = messages[messages.length - 1]?.role === 'user';
        scrollToBottom(isUserMessage);

        // Cleanup timeout on unmount
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [messages, scrollToBottom]);

    return (
        <div 
            className={`${styles.chatApp} ${styles.chatHistoryContainer} ${styles.scrollable} ${isNewConversation ? styles.newConversation : ''}`}
        >
            {isNewConversation ? (
                <div className={styles.newConversationContainer}>
                    <h1>How can I help you today?</h1>
                    <div className={styles.suggestions}>
                        <button onClick={() => setMessage("Help me write a function that...")}>
                            Help me write a function that...
                        </button>
                        <button onClick={() => setMessage("Explain how to implement...")}>
                            Explain how to implement...
                        </button>
                        <button onClick={() => setMessage("Debug this code...")}>
                            Debug this code...
                        </button>
                        <button onClick={() => setMessage("What's the best way to...")}>
                            What's the best way to...
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <ChatHistory messages={messages} />
                    <div ref={messagesEndRef} style={{ height: '1px', margin: 0 }} />
                </>
            )}
        </div>
    );
}

export default ChatApp;

import React, { useRef, useEffect, useCallback, useState } from 'react';
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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showNewConversation, setShowNewConversation] = useState(true);
    const isNewConversation = messages.length === 0;

    useEffect(() => {
        if (!isNewConversation && showNewConversation) {
            setIsTransitioning(true);
            setTimeout(() => {
                setShowNewConversation(false);
                setIsTransitioning(false);
            }, 300);
        } else if (isNewConversation && !showNewConversation) {
            setShowNewConversation(true);
        }
    }, [isNewConversation]);

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

    const handleSuggestionClick = (prompt) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setMessage(prompt);
            setIsTransitioning(false);
        }, 300);
    };

    const suggestions = [
        {
            title: "Code Assistant",
            description: "Get help writing clean, efficient code with best practices and modern patterns",
            icon: "code",
            prompt: "Help me write a function that..."
        },
        {
            title: "Code Explanation",
            description: "Understand complex code snippets, algorithms, and programming concepts",
            icon: "school",
            prompt: "Explain how to implement..."
        },
        {
            title: "Debug Helper",
            description: "Find and fix bugs, optimize performance, and improve code quality",
            icon: "bug_report",
            prompt: "Debug this code..."
        },
        {
            title: "Best Practices",
            description: "Learn industry standards, design patterns, and coding conventions",
            icon: "auto_awesome",
            prompt: "What's the best way to..."
        }
    ];

    const featuredPrompts = [
        "Convert to TypeScript",
        "Optimize performance",
        "Add error handling",
        "Write unit tests",
        "Explain this pattern"
    ];

    return (
        <div 
            className={`${styles.chatApp} ${styles.chatHistoryContainer} ${styles.scrollable}`}
        >
            {(showNewConversation) ? (
                <div className={`${styles.newConversationContainer} ${isTransitioning ? styles.transitioning : ''}`}>
                    <h1>Let's start coding together</h1>
                    <div className={styles.suggestions}>
                        {suggestions.map((suggestion, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleSuggestionClick(suggestion.prompt)}
                            >
                                <span className={`material-symbols-outlined ${styles.suggestionIcon}`}>
                                    {suggestion.icon}
                                </span>
                                <div className={styles.suggestionContent}>
                                    <div className={styles.suggestionTitle}>{suggestion.title}</div>
                                    <div className={styles.suggestionDescription}>{suggestion.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className={styles.featuredSuggestions}>
                        {featuredPrompts.map((prompt, index) => (
                            <div 
                                key={index}
                                className={styles.featuredChip}
                                onClick={() => handleSuggestionClick(prompt)}
                            >
                                {prompt}
                            </div>
                        ))}
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

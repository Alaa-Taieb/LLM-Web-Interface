import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import debounce from 'lodash/debounce';
import ChatHistory from '../ChatHistory/ChatHistory';
import styles from './ChatApp.module.css';
import MessageStyles from '../Message/Message.module.css';

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
    const chatHistoryRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showNewConversation, setShowNewConversation] = useState(true);
    const [isVisible, setIsVisible] = useState(true); // New state for controlling visibility
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Handle initial conversation switching
    useEffect(() => {
        if (selectedConversationId) {
            setIsLoadingMessages(true);
            const timer = setTimeout(() => {
                if (messages && messages.length > 0) {
                    setShowNewConversation(false);
                    setIsVisible(false);
                }
                setIsLoadingMessages(false);
            }, 300); // Increased delay slightly for smoother transition
            return () => clearTimeout(timer);
        }
    }, [selectedConversationId, messages]);

    // Handle messages state with smoother transitions
    useEffect(() => {
        let timer;
        if (messages && messages.length > 0) {
            setShowNewConversation(false);
            setIsVisible(false);
            setIsLoading(false);
            setIsLoadingMessages(false);
        } else if (selectedConversationId && (!messages || messages.length === 0)) {
            if (!isLoadingMessages) {
                // Add a small delay before showing the new conversation UI
                timer = setTimeout(() => {
                    setShowNewConversation(true);
                    setIsVisible(true);
                    setIsLoading(false);
                }, 200);
            }
        } else if (!selectedConversationId) {
            setShowNewConversation(true);
            setIsVisible(true);
            setIsLoading(false);
            setIsLoadingMessages(false);
        }
        return () => clearTimeout(timer);
    }, [messages, selectedConversationId, isLoadingMessages]);

    // Debounced scroll function
    const debouncedScrollToBottom = useMemo(
        () => debounce(() => {
            if (!shouldAutoScroll || !messagesEndRef.current) return;
            
            messagesEndRef.current.scrollIntoView({ 
                behavior: isStreaming ? 'auto' : 'smooth',
                block: 'end'
            });
        }, 100, { leading: true, trailing: true }),
        [shouldAutoScroll, isStreaming]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedScrollToBottom.cancel();
        };
    }, [debouncedScrollToBottom]);

    // Function to check if user is near bottom
    const isNearBottom = useCallback(() => {
        if (!chatHistoryRef.current) return true;
        
        const container = chatHistoryRef.current;
        const threshold = 100; // pixels from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        setShouldAutoScroll(isNearBottom());
    }, [isNearBottom]);

    // Add scroll event listener
    useEffect(() => {
        const container = chatHistoryRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Auto-scroll on new messages or content updates
    useEffect(() => {
        if (isStreaming && shouldAutoScroll) {
            debouncedScrollToBottom();
        } else if (!isStreaming) {
            // For non-streaming updates, scroll immediately
            debouncedScrollToBottom();
        }
    }, [messages, isStreaming, shouldAutoScroll, debouncedScrollToBottom]);

    const handleSuggestionClick = (prompt) => {
        setIsTransitioning(true);
        setIsVisible(false);
        setTimeout(() => {
            setMessage(prompt); // Only set the message, don't send it
            setShowNewConversation(false);
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
            prompt: "Explain how this code works..."
        },
        {
            title: "Debug Helper",
            description: "Find and fix bugs, optimize performance, and improve code quality",
            icon: "bug_report",
            prompt: "Help me debug this code..."
        },
        {
            title: "Best Practices",
            description: "Learn industry standards, design patterns, and coding conventions",
            icon: "auto_awesome",
            prompt: "What are the best practices for..."
        }
    ];

    const featuredPrompts = [
        "Optimize this algorithm",
        "Review my code",
        "Unit test example",
        "Design pattern help",
        "API design tips"
    ];

    return (
        <div className={`${styles.chatApp} ${styles.chatHistoryContainer} ${styles.scrollable}`}>
            {isLoadingMessages ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            ) : showNewConversation ? (
                <div className={styles.newConversation}>
                    <div className={`
                        ${styles.newConversationContainer} 
                        ${!isVisible ? styles.fadeOut : styles.fadeIn}
                    `}>
                        <h1>Let's start coding together</h1>
                        <div className={styles.suggestions}>
                            {suggestions.map((suggestion, index) => (
                                <button 
                                    key={index} 
                                    className={styles.suggestionButton}
                                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                                >
                                    <span className={`material-symbols-outlined ${styles.suggestionIcon}`}>
                                        {suggestion.icon}
                                    </span>
                                    <div className={styles.suggestionContent}>
                                        <h3>{suggestion.title}</h3>
                                        <p>{suggestion.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className={styles.featuredSuggestions}>
                            {featuredPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    className={styles.featuredChip}
                                    onClick={() => handleSuggestionClick(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <ChatHistory 
                        messages={messages} 
                        ref={chatHistoryRef}
                    />
                    <div 
                        ref={messagesEndRef} 
                        style={{ 
                            height: '1px', 
                            width: '100%',
                            opacity: 0 
                        }} 
                    />
                </>
            )}
        </div>
    );
};

export default ChatApp;

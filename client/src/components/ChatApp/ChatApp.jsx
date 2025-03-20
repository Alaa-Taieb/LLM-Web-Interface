import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import debounce from 'lodash/debounce';
import ChatHistory from '../ChatHistory/ChatHistory';
import styles from './ChatApp.module.css';
import MessageStyles from '../Message/Message.module.css';

/**
 * Main chat application component.
 * Manages message display, auto-scrolling, and conversation state transitions.
 * 
 * Features:
 * - Smart auto-scrolling behavior
 * - Loading states and transitions
 * - New conversation UI with suggestions
 * - Message history display
 * 
 * @component
 * @param {Object} props
 * @param {string} props.message - Current message text
 * @param {function} props.setMessage - Function to update message text
 * @param {function} props.sendMessage - Function to handle message sending
 * @param {Array<Object>} props.messages - Array of chat messages
 * @param {string|null} props.selectedConversationId - ID of currently selected conversation
 * @returns {JSX.Element} Rendered ChatApp component
 */
const ChatApp = ({ message, setMessage, sendMessage, messages, selectedConversationId }) => {
    /**
     * Refs for scroll management
     * @type {React.RefObject<HTMLDivElement>}
     */
    const messagesEndRef = useRef(null);
    const chatHistoryRef = useRef(null);

    /**
     * UI State Management
     */
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showNewConversation, setShowNewConversation] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    /**
     * Handles initial conversation switching
     * Shows loading state and manages transitions
     */
    useEffect(() => {
        if (selectedConversationId) {
            setIsLoadingMessages(true);
            const timer = setTimeout(() => {
                if (messages && messages.length > 0) {
                    setShowNewConversation(false);
                    setIsVisible(false);
                }
                setIsLoadingMessages(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedConversationId, messages]);

    /**
     * Manages message state transitions
     * Handles showing/hiding new conversation UI based on message state
     */
    useEffect(() => {
        let timer;
        if (messages && messages.length > 0) {
            setShowNewConversation(false);
            setIsVisible(false);
            setIsLoading(false);
            setIsLoadingMessages(false);
        } else if (selectedConversationId && (!messages || messages.length === 0)) {
            if (!isLoadingMessages) {
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

    /**
     * Debounced scroll function for performance
     * Handles smooth scrolling behavior based on streaming state
     */
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

    /**
     * Cleanup debounce on unmount
     */
    useEffect(() => {
        return () => {
            debouncedScrollToBottom.cancel();
        };
    }, [debouncedScrollToBottom]);

    /**
     * Checks if user is near bottom of chat
     * @returns {boolean} True if user is within threshold of bottom
     */
    const isNearBottom = useCallback(() => {
        if (!chatHistoryRef.current) return true;
        
        const container = chatHistoryRef.current;
        const threshold = 100; // pixels from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    /**
     * Updates auto-scroll behavior based on scroll position
     */
    const handleScroll = useCallback(() => {
        setShouldAutoScroll(isNearBottom());
    }, [isNearBottom]);

    /**
     * Sets up scroll event listeners
     */
    useEffect(() => {
        const container = chatHistoryRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    /**
     * Manages auto-scrolling on new messages
     */
    useEffect(() => {
        if (isStreaming && shouldAutoScroll) {
            debouncedScrollToBottom();
        } else if (!isStreaming) {
            debouncedScrollToBottom();
        }
    }, [messages, isStreaming, shouldAutoScroll, debouncedScrollToBottom]);

    /**
     * Handles suggestion click with smooth transition
     * @param {string} prompt - Selected suggestion text
     */
    const handleSuggestionClick = (prompt) => {
        setIsTransitioning(true);
        setIsVisible(false);
        setTimeout(() => {
            setMessage(prompt);
            setShowNewConversation(false);
            setIsTransitioning(false);
        }, 300);
    };

    /**
     * Predefined suggestion options
     * @type {Array<{title: string, description: string, icon: string, prompt: string}>}
     */
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

    /**
     * Featured prompt suggestions
     * @type {Array<string>}
     */
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

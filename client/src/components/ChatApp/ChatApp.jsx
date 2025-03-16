import React, { useRef, useEffect, useCallback, useState } from 'react';
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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showNewConversation, setShowNewConversation] = useState(true);
    const [isVisible, setIsVisible] = useState(true); // New state for controlling visibility

    useEffect(() => {
        if (selectedConversationId && messages && messages.length > 0) {
            handleNewConversationHide();
        } else if (!selectedConversationId || messages.length === 0) {
            setShowNewConversation(true);
            setIsVisible(true);
        }
    }, [selectedConversationId, messages]);

    // New function to handle hiding the new conversation UI
    const handleNewConversationHide = () => {
        setIsTransitioning(true);
        setIsVisible(false);
        setTimeout(() => {
            setShowNewConversation(false);
            setIsTransitioning(false);
        }, 300); // Match this with the animation duration in CSS
    };

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

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
            {showNewConversation ? (
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
                    <ChatHistory messages={messages} />
                    <div ref={messagesEndRef} />
                </>
            )}
        </div>
    );
}

export default ChatApp;

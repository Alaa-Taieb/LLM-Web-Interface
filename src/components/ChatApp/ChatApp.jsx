import React, { useContext } from 'react';
import Groq from 'groq-sdk';
import { useState } from 'react';
import ChatInput from '../ChatInput/ChatInput';
import ChatHistory from '../ChatHistory/ChatHistory';
import styles from './ChatApp.module.css';
import HandleMessages from '../../utils/HandleMessages';
import GroqContext from '../GroqContext';

/**
 * Main chat application component.
 * 
 * This component serves as the core of the chat application, managing the message input,
 * message history display, and interaction with the Groq SDK. It uses the GroqContext
 * to obtain configuration details and handles messages via the `HandleMessages` utility.
 * 
 * @returns {JSX.Element} The rendered ChatApp component.
 */
const ChatApp = () => {
    // Retrieve the Groq instance from context to be used in message handling
    const [groq] = useContext(GroqContext);

    // State hook for managing the current input message
    const [message , setMessage] = useState("");

    // Destructure the messages array and sendMessage function from the HandleMessages utility
    const {messages , sendMessage} = HandleMessages(new Groq(groq));

    return (
        <div className={styles.chatApp}>
            {/* Render the chat history, passing the messages array */}
            <ChatHistory messages={messages}/>

            {/* Spacer div to add some space before the input field */}
            <div style={{height: "100px"}}></div>

            {/* Render the chat input field, passing necessary props for message management */}
            <ChatInput  setMessage={setMessage} sendMessage={sendMessage} message={message}/>
        </div>
    );
}

export default ChatApp;



import React, { useRef, useContext, useEffect } from 'react';
import ChatHistory from '../ChatHistory/ChatHistory';
import styles from './ChatApp.module.css';
import scrollTo from '../../utils/ScrollTo';
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
const ChatApp = ({message , setMessage , messages , sendMessage}) => {
    // Reference to the end of the chat history, used for auto-scrolling
    const endBlockRef = useRef();
    const chatHistoryRef = useRef(null);

    /**
     * useEffect hook to scroll to the end of the chat history whenever a new message is added.
     * 
     * The scrollTo function is called with the endBlockRef to ensure smooth scrolling to the latest message.
     */
    useEffect(() => {
        const chatHistory = chatHistoryRef.current;

        if (chatHistory) {
                scrollTo(endBlockRef , {behavior: "smooth"});
        }
    }, [messages]);

    const copyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            console.log('Code copied to clipboard');
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };
    
    return (
        <div className={`${styles.chatApp} ${styles.chatHistoryContainer} ${styles.scrollable}`} ref={chatHistoryRef} onClick={(event) => {
            // if (event.target.classList.contains(MessageStyles.copyButton)) {
            //     alert("Clicked!")
            //     const code = event.target.dataset.code;
            //     copyCode(code);
            // }
        }}>
            {/* Render the chat history, passing the messages array */}
            <ChatHistory messages={messages} endBlockRef={endBlockRef}/>

            {/* Spacer div to add some space before the input field */}
            <div ref={endBlockRef}></div>

            {/* Render the chat input field, passing necessary props for message management */}
            {/* <ChatInput  setMessage={setMessage} sendMessage={sendMessage} message={message}/> */}
        </div>
    );
}

export default ChatApp;



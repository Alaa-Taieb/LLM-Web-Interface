import React, { useContext } from 'react';
import Groq from 'groq-sdk';
import { useState } from 'react';
import ChatInput from '../ChatInput/ChatInput';
import ChatHistory from '../ChatHistory/ChatHistory';
import styles from './ChatApp.module.css';
import HandleMessages from '../../utils/HandleMessages';
import GroqContext from '../GroqContext';


const ChatApp = () => {
    const [groq] = useContext(GroqContext);

    const [message , setMessage] = useState("");
    const {messages , sendMessage} = HandleMessages(new Groq(groq));

    return (
        <div className={styles.chatApp}>
            <ChatHistory messages={messages}/>
            <div style={{height: "100px"}}></div>
            <ChatInput  setMessage={setMessage} sendMessage={sendMessage} message={message}/>
        </div>
    );
}

export default ChatApp;



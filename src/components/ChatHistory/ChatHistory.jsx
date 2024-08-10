import React from 'react';
import Message from '../Message/Message';
import styles from './ChatHistory.module.css'
const ChatHistory = ({messages}) => {
    return (
        <div className={styles.history}>
            {messages.map((item,i) => <Message key={i} message={item}/>)}
        </div>
    );
}

export default ChatHistory;

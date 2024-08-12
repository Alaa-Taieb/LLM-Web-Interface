import React from 'react';
import Message from '../Message/Message';
import styles from './ChatHistory.module.css'

/**
 * Component to display the chat history.
 * 
 * This component renders a list of messages passed as props. Each message is displayed
 * using the `Message` component. The messages are wrapped in a container styled with
 * the CSS module imported as `styles`.
 * 
 * @param {Object} props - The props object.
 * @param {Array} props.messages - An array of message objects to be displayed in the chat history.
 * @returns {JSX.Element} The rendered ChatHistory component.
 */
const ChatHistory = ({messages}) => {
    return (
        <div className={styles.history}>
            {/* Map over the messages array and render a Message component for each item */}
            {messages.map((item,i) => <Message key={i} message={item}/>)}
        </div>
    );
}

export default ChatHistory;

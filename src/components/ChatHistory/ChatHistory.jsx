import React from 'react';
import Message from '../Message/Message';
import styles from './ChatHistory.module.css'

/**
 * Component to display the chat history.
 * 
 * This component renders a list of messages passed as props. Each message is displayed
 * using the `Message` component. Messages from the system role are filtered out before
 * rendering. The messages are wrapped in a container styled with the CSS module imported as `styles`.
 * 
 * @param {Object} props - The props object.
 * @param {Array} props.messages - An array of message objects to be displayed in the chat history.
 * @param {React.RefObject} [props.endBlockRef] - Optional reference for scrolling to the end of the chat.
 * @returns {JSX.Element} The rendered ChatHistory component.
 */
const ChatHistory = ({messages ,endBlockRef}) => {
    return (
        <div className={styles.history}>
            {/* Map over the messages array and render a Message component for each item */}
            {messages.filter(message => message.role != 'system').map((item,i) => <Message endBlockRef={endBlockRef} key={i} message={item}/>)}
        </div>
    );
}

export default ChatHistory;

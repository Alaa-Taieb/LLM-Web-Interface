import React from 'react';
import styles from './Message.module.css';
import showdown from 'showdown';
import TypingEffect from '../TypingEffect/TypingEffect';

/**
 * Component to render individual messages in the chat.
 * 
 * This component handles both user and admin messages. It uses the Showdown library
 * to convert Markdown content to HTML. Messages from the user are displayed with 
 * a different style compared to admin messages.
 * 
 * @param {Object} props - The props object.
 * @param {Object} props.message - The message object containing the role and content.
 * @param {string} props.message.role - The role of the message sender (e.g., "user" or "admin").
 * @param {string} props.message.content - The content of the message.
 * @returns {JSX.Element} The rendered Message component.
 */
const Message = ({ message }) => {

    /**
     * Converter instance to transform Markdown into HTML.
     * @type {showdown.Converter}
     */
    const converter = new showdown.Converter();

    /**
     * Converts the message content based on the sender's role.
     * 
     * For user messages, the content is returned as plain text. For admin messages,
     * Markdown content is converted to HTML.
     * 
     * @param {Object} messageObject - The message object containing the role and content.
     * @returns {string} The processed message content, either as plain text or HTML.
     */
    const convert = (messageObject) => {
        if (messageObject.role === 'user') {
            return messageObject.content;
        }
        let messageContent = messageObject.content;
        messageContent = converter.makeHtml(messageContent);
        return messageContent;
    };

    return (
        <div className={message.role === 'user' ? styles.mUser : styles.mAdmin}>
            {message.role === 'user' ? (
                <div>{message.content}</div>
            ) : (
                <TypingEffect text={convert(message)} speed={10} />
            )}
        </div>
    );
};

export default Message;

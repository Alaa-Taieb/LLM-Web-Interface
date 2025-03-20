import React, { useState, useCallback } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import styles from './Footer.module.css';
import CircularProgress from '@mui/joy/CircularProgress';

/**
 * Footer component that renders a message input area with a send button.
 * Supports multi-line input with auto-expanding textarea and message sending functionality.
 *
 * @component
 * @param {Object} props
 * @param {function} props.setMessage - Function to update the message state in parent component
 * @param {function} props.sendMessage - Function to handle sending the message
 * @param {string} props.message - Current message text value
 * @param {boolean} props.isSending - Flag indicating if a message is currently being sent
 * @param {function} props.setIsSending - Function to update the sending state
 */
const Footer = ({ setMessage, sendMessage, message, isSending, setIsSending }) => {
    /**
     * State to track the number of rows in the textarea
     * @type {[number, function]} rows - Number of visible rows in textarea
     */
    const [rows, setRows] = useState(1);

    /**
     * Handles sending the message
     * Triggers the send action, clears the input, and resets the textarea size
     * 
     * @callback
     * @fires {function} setIsSending - Updates the sending state to true
     * @fires {function} sendMessage - Sends the current message
     * @fires {function} setMessage - Clears the message input
     * @fires {function} setRows - Resets textarea to single row
     */
    const handleSend = useCallback(() => {
        setIsSending(true);
        sendMessage(message);
        setMessage("");
        setRows(1);
    }, [sendMessage, message, setIsSending, setMessage]);

    /**
     * Handles changes to the textarea input
     * Updates message content and adjusts textarea rows based on content
     * 
     * @callback
     * @param {React.ChangeEvent<HTMLTextAreaElement>} event - The change event
     * @fires {function} setMessage - Updates the message content
     * @fires {function} setRows - Updates the number of visible rows
     */
    const handleChange = useCallback((event) => {
        const { value } = event.target;
        setMessage(value);
        // Calculate rows based on newlines, limit to maximum of 5 rows
        setRows(Math.min(value.split('\n').length, 5));
    }, [setMessage]);

    return (
        <div className={styles.footerContainer}>
            <textarea
                placeholder='Ask anything'
                rows={rows}
                className={styles.footerTextarea}
                onChange={handleChange}
                value={message}
                onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey && !isSending) {
                        event.preventDefault(); // Prevent newline on Enter
                        handleSend();
                    }
                }}
            />
            <button
                className={styles.footerButton}
                onClick={handleSend}
                disabled={isSending}
            >
                {isSending ? (
                    <CircularProgress size="sm" color="neutral" />
                ) : (
                    <ArrowCircleUpIcon />
                )}
            </button>
        </div>
    );
}

export default Footer;

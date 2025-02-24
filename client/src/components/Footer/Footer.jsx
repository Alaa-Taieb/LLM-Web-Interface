import React, { useState, useCallback } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import styles from './Footer.module.css'; // Import the CSS module
import CircularProgress from '@mui/joy/CircularProgress'; // Import CircularProgress

/**
 * Component to render the input field and send button.
 *
 * @param {Object} props - The component props.
 * @param {function} props.setMessage - Function to set the message state.
 * @param {function} props.sendMessage - Function to send the message.
 * @param {string} props.message - The current message text.
 * @param {boolean} props.isSending - Whether a message is currently being sent.
 * @param {function} props.setIsSending - Function to set the isSending state.
 */
const Footer = ({ setMessage, sendMessage, message, isSending, setIsSending }) => {
    const [rows, setRows] = useState(1);

    const handleSend = useCallback(() => {
        setIsSending(true);
        sendMessage(message);
        setMessage("");
        setRows(1); // Reset rows after sending
    }, [sendMessage, message, setIsSending]);

    const handleChange = useCallback((event) => {
        const { value } = event.target;
        setMessage(value);
        setRows(Math.min(value.split('\n').length, 5)); // Limit to 5 rows
    }, [setMessage, setRows]);

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
                {isSending ? <CircularProgress size="sm" color="neutral" /> : <ArrowCircleUpIcon />}
            </button>
        </div>
    );
}

export default Footer;

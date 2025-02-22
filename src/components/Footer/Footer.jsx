import React, { useState } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import styles from './Footer.module.css'; // Import the CSS module
import CircularProgress from '@mui/joy/CircularProgress'; // Import CircularProgress

const Footer = ({setMessage , sendMessage , message, isSending, setIsSending}) => {
    const [rows, setRows] = useState(1);

    const handleSend = e => {
        setIsSending(true);
        sendMessage(message);
        setMessage("");
        setRows(1); // Reset rows after sending
    }

    const handleChange = e => {
        setMessage(e.target.value);
        const newLines = e.target.value.split('\n').length;
        setRows(Math.min(newLines, 5)); // Limit to 5 rows
    };

    return (
        <div className={styles.footerContainer}>
            <textarea
                placeholder='Ask anything'
                rows={rows}
                className={styles.footerTextarea}
                onChange={handleChange}
                value={message}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault(); // Prevent newline on Enter
                        handleSend();
                    }
                }}
            />
            <button 
                className={styles.footerButton}
                onClick={handleSend}
                disabled={isSending}
            >
                {isSending ? <CircularProgress size="sm" color="neutral" /> : <ArrowCircleUpIcon/>}
            </button>
        </div>
    );
}

export default Footer;

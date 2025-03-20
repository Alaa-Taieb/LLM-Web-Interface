import React, { createRef, useEffect, useState } from 'react';
import styles from './ChatInput.module.css';
import useWindowDimensions from '../../utils/WindowDimensions';

/**
 * ChatInput component provides a responsive text input area for chat messages.
 * Features include:
 * - Dynamic width adjustment based on window size
 * - Automatic line breaks for long messages
 * - Enter key submission (without Shift)
 * - Maximum 7 rows of text
 * 
 * @component
 * @param {Object} props
 * @param {function} props.setMessage - Function to update the message state in parent
 * @param {string} props.message - Current message text value
 * @param {function} props.sendMessage - Function to handle message submission
 * @returns {JSX.Element} Rendered ChatInput component
 * 
 * @example
 * <ChatInput
 *   setMessage={handleMessageUpdate}
 *   message={currentMessage}
 *   sendMessage={handleMessageSubmit}
 * />
 */
const ChatInput = ({ setMessage, message, sendMessage }) => {
    /**
     * Get current window dimensions using custom hook
     * @type {{height: number, width: number}}
     */
    const { height, width } = useWindowDimensions();

    /**
     * State to control input width based on window size
     * @type {[number, function]} inputWidth - Number of columns for textarea
     */
    const [inputWidth, setInputWidth] = useState(100);

    /**
     * Form reference for programmatic submission
     * @type {React.RefObject<HTMLFormElement>}
     */
    let formRef = createRef();

    /**
     * Updates input width when window size changes
     * Calculates width as 10% of window width, with minimum of 100 columns
     */
    useEffect(() => {
        setInputWidth(width / 10 < 100 ? width / 10 : 100);
    }, [width]);

    /**
     * Handles form submission
     * Prevents default form behavior, sends message, and clears input
     * 
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    };

    /**
     * Handles textarea input changes
     * Features:
     * - Automatically adds line breaks for long lines
     * - Limits maximum rows to 7
     * - Updates textarea height dynamically
     * 
     * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Change event
     */
    const handleChange = e => {
        let inputValue = e.target.value;

        // Insert line break every 'inputWidth' characters
        if ((inputValue.length % inputWidth === 0) && (inputValue.length !== 0)) {
            inputValue = `${inputValue}\n`;
        }
        
        // Calculate and limit number of rows (max 7)
        let lineBreakCount = inputValue.split("\n").length;
        lineBreakCount = lineBreakCount > 7 ? 7 : lineBreakCount;
        e.target.rows = lineBreakCount;

        setMessage(inputValue);
    };

    /**
     * Handles Enter key press for form submission
     * Submits only if:
     * - Enter key is pressed
     * - Shift is not held
     * - Message is not empty
     * 
     * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - Keyboard event
     */
    const onEnterPress = (e) => {
        if (e.keyCode === 13 && !e.shiftKey && message.trim() !== "") {
            e.preventDefault();
            formRef.current.requestSubmit();
        }
    };

    return (
        <div className={styles.input_container}>
            <form ref={formRef} onSubmit={handleSend} className={styles.input}>
                <textarea
                    className={styles.text_area}
                    cols={inputWidth}
                    rows="1"
                    placeholder='Type your message here'
                    onChange={handleChange}
                    value={message}
                    onKeyDown={onEnterPress}
                />
                <button
                    type='submit'
                    className={message ? styles.button_enabled : styles.button_disabled}
                    disabled={!message}
                >
                    <span className="material-symbols-outlined">
                        arrow_upward
                    </span>
                </button>
            </form>
        </div>
    );
};

export default ChatInput;

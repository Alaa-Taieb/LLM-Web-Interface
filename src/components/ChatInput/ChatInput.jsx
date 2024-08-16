import React , {createRef} from 'react';
import styles from './ChatInput.module.css';

/**
 * Component for the chat input area.
 * 
 * This component provides a text area for users to type messages, which can be sent by
 * pressing the submit button or by pressing Enter (without Shift). It adjusts the text
 * area's row count dynamically based on the input length and adds a line break every
 * 100 characters.
 * 
 * @param {Object} props - The props object.
 * @param {Function} props.setMessage - Function to update the message state.
 * @param {string} props.message - The current message being typed.
 * @param {Function} props.sendMessage - Function to send the current message.
 * @returns {JSX.Element} The rendered ChatInput component.
 */
const ChatInput = ({setMessage , message , sendMessage}) => {

    /**
     * Reference to the form element, used to programmatically submit the form.
     * @type {React.RefObject<HTMLFormElement>}
     */
    let formRef = createRef();

    /**
     * Handles the form submission to send the message.
     * 
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    }

    /**
     * Handles changes in the textarea, updates the message state, and adjusts the
     * number of rows in the textarea based on the input length.
     * 
     * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event from the textarea.
     */
    const handleChange = e => {
        let inputValue = e.target.value;

        // Insert a line break every 100 characters
        if ((inputValue.length % 100 == 0) && (inputValue.length != 0))
            inputValue = `${inputValue}\n`;
        
        // Limit the number of line breaks to a maximum of 7 rows
        let lineBreakCount = inputValue.split("\n").length;
        lineBreakCount = lineBreakCount > 7 ? 7 : lineBreakCount;
        e.target.rows = lineBreakCount;

        setMessage(inputValue);
    }

    /**
     * Handles the "Enter" key press to submit the form if Enter is pressed without Shift.
     * 
     * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event.
     */
    const onEnterPress = (e) => {
        if(e.keyCode == 13 && e.shiftKey == false && message.trim() != "") {
            e.preventDefault();
            console.log(formRef.current);
            formRef.current.requestSubmit();
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSend} className={styles.input}>
            <textarea
                className={styles.text_area}
                cols="100"
                rows="1"
                placeholder='Type your message here'
                onChange={handleChange}
                value={message}
                onKeyDown={onEnterPress}
            >
            </textarea>
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
    );
}

export default ChatInput;

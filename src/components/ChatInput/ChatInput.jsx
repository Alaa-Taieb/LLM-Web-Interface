import React , {createRef} from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({setMessage , message , sendMessage}) => {

    
    let formRef = createRef();

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    }

    const handleChange = e => {
        let inputValue = e.target.value;
        if ((inputValue.length % 100 == 0) && (inputValue.length != 0))
            inputValue = `${inputValue}\n`;
        
        let lineBreakCount = inputValue.split("\n").length;
        lineBreakCount = lineBreakCount > 7 ? 7 : lineBreakCount;
        e.target.rows = lineBreakCount;
        setMessage(inputValue);
    }

    const onEnterPress = (e) => {
        if(e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            console.log(formRef.current);
            formRef.current.requestSubmit();
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSend} className={styles.input} >
            <textarea className={styles.text_area}  cols="100" rows="1" placeholder='Type your message Here' onChange={handleChange} value={message} onKeyDown={onEnterPress}>

            </textarea>
            <button type='submit' className={message ? styles.button_enabled : styles.button_disabled} disabled={message ? false : true} >
                <span class="material-symbols-outlined">
                arrow_upward
                </span>
            </button>
        </form>
    );
}

export default ChatInput;

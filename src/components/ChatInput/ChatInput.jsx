import React , {createRef, useContext} from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({setMessage , message , sendMessage}) => {

    
    let myFormRef = createRef();

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("");
    }

    const handleChange = e => {
        let v = e.target.value;
        if ((v.length % 100 == 0) && (v.length != 0)){
            v = `${v}\n`;
        }
        let lb_n = v.split("\n").length;
        lb_n = lb_n > 7 ? 7 : lb_n;
        e.target.rows = lb_n;
        setMessage(v);
    }

    const onEnterPress = (e) => {
        if(e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            console.log(myFormRef.current);
            myFormRef.current.requestSubmit();
        }
    }

    return (
        <form ref={myFormRef} onSubmit={handleSend} className={styles.input} >
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

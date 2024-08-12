import React , {useEffect} from 'react';
import styles from './Message.module.css';
import showdown from 'showdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-twilight.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-ruby';

/**
 * Component to render individual messages in the chat.
 * 
 * This component handles both user and admin messages. It uses the Showdown library
 * to convert Markdown content to HTML and the Prism library to highlight code syntax.
 * Messages from the user are displayed with a different style compared to admin messages.
 * 
 * @param {Object} props - The props object.
 * @param {Object} props.message - The message object containing the role and content.
 * @param {string} props.message.role - The role of the message sender (e.g., "user" or "admin").
 * @param {string} props.message.content - The content of the message.
 * @returns {JSX.Element} The rendered Message component.
 */
const Message = ({message}) => {

    /**
     * Converter instance to transform Markdown into HTML.
     * @type {showdown.Converter}
     */
    const converter = new showdown.Converter();

    /**
     * Hook to apply syntax highlighting to all code blocks in the message content
     * whenever the component mounts or updates.
     */
    useEffect(() => {
        Prism.highlightAll();
    }, []);

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
        if (messageObject.role == 'user'){
            return messageObject.content;
        }
        let messageContent = messageObject.content;
        messageContent = converter.makeHtml(messageContent);
        return messageContent;
    }

    return (
        <div  className={ message.role == "user" ? styles.mUser : styles.mAdmin} >
            {/* Render the message content, with HTML safely injected if necessary */}
            <div dangerouslySetInnerHTML={{__html: convert(message)}}></div>
        </div>
    );
}

export default Message;

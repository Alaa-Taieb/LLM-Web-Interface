import React, { useEffect, useRef, memo } from 'react';
import styles from './Message.module.css';
import showdown from 'showdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.min.css'; // Choose a theme

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
    const messageRef = useRef(null);

    useEffect(() => {
        if (messageRef.current) {
            hljs.highlightAll();
        }
    }, [message.content]);

    // Define the hljs extension for showdown
    const hljsSetup = function(converter) {
        return {
            type: 'output',
            filter: function (text, converter, options) {
                // use new shodown's regexp engine to conditionally parse codeblocks
                return text.replace(/<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi, function (match, code) {
                    let highlighted = hljs.highlightAuto(code).value;
                    // Replace ampersands with their unescaped counterparts
                    highlighted = highlighted.replace(/&amp;/g, '&');
                    highlighted = highlighted.replace(/<;/g, '<').replace(/>;/g, '>');
                    // alert(highlighted);
                    return '<pre><code class="hljs">' + highlighted + '</code></pre>';
                });
            }
        };
    };

    /**
     * Converter instance to transform Markdown into HTML.
     */
    const converter = new showdown.Converter({
        noHeaderId: true,
        tables: true,
        strikethrough: true,
        tasklists: true,
        simplifiedAutoLink: true,
        extensions: [hljsSetup],
        escapeHtml: false, // Disable HTML escaping
        simpleLineBreaks: true, // Enable automatic line breaks
    });

    /**
     * Converts the message content based on the sender's role.
     * 
     * @param {Object} messageObject - The message object containing the role and content.
     * @returns {string} The processed message content, either as plain text or HTML.
     */
    const convert = ({ role, content }) => {
        if (role === 'user') {
            return content;
        }

        let messageContent = content;

        // Remove semicolons after angle brackets
        messageContent = messageContent.replace(/<;/g, '<').replace(/>;/g, '>');

        return converter.makeHtml(messageContent);
    };

    const { role, content } = message;
    return (
        <div className={`${role === 'user' ? styles.mUser : styles.mAdmin} ${content === "Sorry, there was an error processing your request. Please try again." ? styles.mError : ""}`} ref={messageRef}>
            {role === 'user' ? (
                <div>{content}</div>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: convert(message) }} />
            )}
        </div>
    );
};

export default memo(Message);

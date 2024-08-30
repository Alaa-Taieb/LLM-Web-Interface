import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';

// Import PrismJS themes and language components for syntax highlighting
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
 * TypingEffect component renders text with a typing animation effect, character by character.
 * 
 * This component uses Prism.js for syntax highlighting of code snippets within the text. As
 * the text is typed out, Prism.js is applied to highlight any code blocks in the text.
 * 
 * @param {Object} props - The properties object.
 * @param {string} props.text - The full text to be displayed with the typing effect.
 * @param {number} [props.speed=50] - The typing speed in milliseconds per character. Default is 50ms.
 * 
 * @returns {JSX.Element} The TypingEffect component that displays text with a typing animation.
 */
const TypingEffect = ({ text, speed = 50 }) => {
    // State to store the text currently being displayed, updated one character at a time
    const [displayedText, setDisplayedText] = useState('');

    // State to track the current index of the character being typed
    const [index, setIndex] = useState(0);

    /**
     * Effect to handle the typing animation.
     * 
     * This effect runs on each change of the `index` state. If there are still characters to type,
     * it schedules the next character to be appended to `displayedText` after a delay specified by `speed`.
     * Prism.js is used to apply syntax highlighting to any code snippets within the text.
     */
    useEffect(() => {
        if (index < text.length) {
        const timeoutId = setTimeout(() => {
            // Append the next character to the displayed text
            setDisplayedText((prev) => prev + text[index]);

            // Move to the next character index
            setIndex((prev) => prev + 1);
        }, speed);

        // Apply syntax highlighting to the displayed text
        Prism.highlightAll();

        // Cleanup function to clear the timeout and reapply Prism highlighting
        return () => {
            clearTimeout(timeoutId);
            Prism.highlightAll();
        };
        }
    }, [index, text, speed]);

    // Render the displayed text, including any HTML (such as code blocks)
    return <div dangerouslySetInnerHTML={{__html: displayedText}}></div>;
};

export default TypingEffect;

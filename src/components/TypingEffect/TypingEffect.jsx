import React, { useState, useEffect, useRef } from 'react';
import scrollTo from '../../utils/ScrollTo';

/**
 * TypingEffect component renders text with a typing animation effect, character by character.
 *
 * This component now relies on highlight.js, which is applied in the Message component,
 * so it no longer needs to handle syntax highlighting directly.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.text - The full text to be displayed with the typing effect.
 * @param {number} [props.speed=50] - The typing speed in milliseconds per character. Default is 50ms.
 * @param {React.RefObject} [props.endBlockRef] - Optional reference for scrolling to the end of the text.
 *
 * @returns {JSX.Element} The TypingEffect component that displays text with a typing animation.
 */
const TypingEffect = ({ text, speed = 50, endBlockRef }) => {
    // State to store the text currently being displayed, updated one character at a time
    const [displayedText, setDisplayedText] = useState('');

    // State to track the current index of the character being typed
    const [index, setIndex] = useState(0);

    /**
     * Effect to handle the typing animation.
     *
     * This effect runs on each change of the `index` state. If there are still characters to type,
     * it schedules the next character to be appended to `displayedText` after a delay specified by `speed`.
     */
    // useEffect(() => {
    //     if (index < text.length) {
    //         const timeoutId = setTimeout(() => {
    //             // Append the next character to the displayed text
    //             setDisplayedText((prev) => prev + text[index]);

    //             // Move to the next character index
    //             setIndex((prev) => prev + 1);

    //             // Scroll to the end block
    //             scrollTo(endBlockRef, {});
    //         }, speed);

    //         // Cleanup function to clear the timeout
    //         return () => clearTimeout(timeoutId);
    //     }
    // }, [index, text, speed, endBlockRef]);

    // Render the displayed text, including any HTML (such as code blocks)
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
};

export default TypingEffect;

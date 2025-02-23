import React, { memo, useState, useCallback } from "react";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/vs2015.min.css"; // Choose a theme
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import styles from "./Message.module.css";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const Message = ({ message }) => {
    const { role, content } = message;
    const [copied, setCopied] = useState(null); // Track copied code blocks

    const handleCopy = useCallback(async (code, index) => {
        navigator.clipboard.writeText(code);
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    const extractCodeText = useCallback((children) => {
        if (!children) return ""; // Handle undefined/null cases
        if (typeof children === "string") return children; // If it's already a string, return it
        if (!Array.isArray(children)) return extractCodeText([children]); // Wrap single elements in an array
    
        return children
            .map(child => {
                if (typeof child === "string") return child;
                if (typeof child === "object" && child.props?.children) {
                    return extractCodeText(child.props.children);
                }
                return "";
            })
            .join("")
            .trim();
    }, []);


    /**
     * Renders code blocks with syntax highlighting and copy button.
     * - Applies only to **multi-line code blocks** inside `<pre>`.
     */
    const renderCodeBlock = useCallback(({ node, className, children, ...props }) => {
        const isBlockCode = className !== undefined; // Block-level code has a class (e.g., `language-js`)
        const language = className ? className.replace("language-", "") : "plaintext";
        const code = extractCodeText(children);
        console.log(code);
        const index = node?.position?.start?.offset || Math.random(); // Unique key

        if (!isBlockCode) {
            return <code className={styles.inlineCode}>{children}</code>;
        }
        // alert(children)
        return (
            <div className={styles.codeBlockContainer}>
                {/* Top Bar */}
                <div className={styles.codeBlockHeader}>
                    <span className={styles.codeBlockLanguage}>{language}</span>
                    <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(code, index)}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease, background-color 0.2s ease',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.85rem',
                            outline: 'none',
                        }}
                        onMouseOver={e => e.target.style.opacity = 1}
                        onMouseOut={e => e.target.style.opacity = 0.7}
                    >
                        {copied === index ? (
                            <>
                            Copied
                            <CheckCircleOutlinedIcon fontSize="small" />
                            </>
                        ) : (
                            <>
                            Copy
                            <FileCopyOutlinedIcon fontSize="small" />
                            </>
                        )}
                    </button>
                </div>

                {/* Code Block */}
                <pre className={styles.codeblock}>
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            </div>
        );
    }, [copied, handleCopy, extractCodeText]);

    return (
        <div className={`${role === "user" ? styles.mUser : styles.mAdmin}`}>
            {role === "user" ? (
                <div>{content}</div>
            ) : (
                <div>
                    <Markdown
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    components={{ code: renderCodeBlock }} // Use custom renderer
                    >
                        {content}
                    </Markdown>
                </div>
            )}
        </div>
    );
};

export default memo(Message);

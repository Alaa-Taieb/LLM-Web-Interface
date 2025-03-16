import React, { memo, useState, useCallback } from "react";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/vs2015.min.css";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import styles from "./Message.module.css";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import hljs from "highlight.js";
import langs from "../../utils/lang";

const Message = ({ message }) => {
    const { role, content } = message;
    const [copied, setCopied] = useState(null);

    const handleCopy = useCallback(async (code, index) => {
        navigator.clipboard.writeText(code);
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    const extractCodeText = useCallback((children) => {
        if (!children) return "";
        if (typeof children === "string") return children;
        if (!Array.isArray(children)) return extractCodeText([children]);
    
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

    const renderCodeBlock = useCallback(({ node, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : 'plaintext';
        const code = extractCodeText(children);
        const index = node?.position?.start?.offset || Math.random();

        // Handle inline code
        if (!className) {
            return <code className={styles.inlineCode}>{children}</code>;
        }

        // Handle block code
        return (
            <div className={styles.codeBlockContainer}>
                <div className={styles.codeBlockHeader}>
                    <span className={styles.codeBlockLanguage}>
                        {langs[`hljs ${language}`] || language}
                    </span>
                    <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(code, index)}
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
                        rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
                        components={{
                            code: renderCodeBlock,
                            pre: ({ children }) => children
                        }}
                    >
                        {content}
                    </Markdown>
                </div>
            )}
        </div>
    );
};

export default memo(Message);

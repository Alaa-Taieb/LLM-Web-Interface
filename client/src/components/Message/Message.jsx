import React, { memo, useState, useCallback, useEffect } from "react";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/vs2015.min.css";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import styles from "./Message.module.css";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import hljs from "highlight.js";
import langs from "../../utils/lang";
import { Avatar } from '@mui/joy';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

const Message = ({ message }) => {
    const { role, content } = message;
    const [copied, setCopied] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                fetch(`http://localhost:5000/api/auth/user/${payload.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(res => res.json())
                .then(data => setUser(data))
                .catch(err => console.error('Error fetching user:', err));
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

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
            <div className={styles.messageContent}>
                {role === "user" ? (
                    <>
                        <div>{content}</div>
                        {user?.avatar && (
                            <Avatar
                                src={user.avatar}
                                alt={user.name}
                                size="sm"
                                sx={{ width: 28, height: 28 , marginTop: '7px'}}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <SmartToyOutlinedIcon sx={{ width: 28, height: 28, color: '#D1D1D1' , marginTop: '7px' }} />
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
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(Message);

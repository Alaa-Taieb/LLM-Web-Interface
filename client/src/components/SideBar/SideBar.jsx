import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Sheet, List, ListItem, Typography, Box, Divider } from '@mui/joy';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'; // Paper icon
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import styles from './SideBar.module.css';

/**
 * Component to render the sidebar with minimize/maximize functionality and conversation list.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.minimized - Whether the sidebar is minimized or not.
 * @param {function} props.setMinimized - Function to set the minimized state.
 * @param {function} props.onConversationSelect - Function to call when a conversation is selected.
 */
const SideBar = ({ minimized, setMinimized, onConversationSelect }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipConversationId, setTooltipConversationId] = useState(null);
    const timeoutRef = useRef(null);
    const [recentConversations, setRecentConversations] = useState([]);
    const [last24HoursConversations, setLast24HoursConversations] = useState([]);
    const [historyConversations, setHistoryConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/groq/conversations');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setConversations(data);

                // Sort conversations by updatedAt in descending order
                const sortedConversations = [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                // Extract recent conversations (last 3)
                setRecentConversations(sortedConversations.slice(0, 3));

                // Extract conversations from the last 24 hours
                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                const last24 = sortedConversations.filter(conversation => new Date(conversation.updatedAt) >= twentyFourHoursAgo);
                setLast24HoursConversations(last24);

                // Extract history conversations (excluding recent and last 24 hours)
                const history = sortedConversations.filter(conversation =>
                    !recentConversations.find(recent => recent._id === conversation._id) &&
                    !last24.find(recent => recent._id === conversation._id)
                );
                setHistoryConversations(history);

                // Select the newest conversation after fetching
                if (data && data.length > 0) {
                    const newestConversation = data[data.length - 1];
                    // setSelectedConversationId(newestConversation._id);
                    onConversationSelect(selectedConversationId);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, [selectedConversationId]); // Add selectedConversationId as a dependency

    const toggleMinimized = () => {
        setMinimized((prevMinimized) => !prevMinimized);
    };

    const handleConversationClick = (conversationId) => {
        console.log("Conversation clicked:", conversationId); // Debugging statement
        setSelectedConversationId(conversationId);
        onConversationSelect(conversationId);
    };

    const fetchConversationName = async (conversationId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/groq/conversations/${conversationId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setConversations(prevConversations => {
                return prevConversations.map(conversation => {
                    if (conversation._id === conversationId) {
                        return { ...conversation, name: data.name };
                    }
                    return conversation;
                });
            });
        } catch (error) {
            console.error("Error fetching conversation name:", error);
        }
    };

    const createNewConversation = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/groq/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: 'New Conversation' }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newConversation = await response.json();
            // Add the new conversation at the beginning of the list
            setConversations(prevConversations => [newConversation, ...prevConversations]);

            setSelectedConversationId(newConversation._id);
            onConversationSelect(newConversation._id);

        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    useEffect(() => {
        const updateConversationName = async () => {
            if (selectedConversationId) {
                const conversation = conversations.find(c => c._id === selectedConversationId);
                if (conversation && conversation.name === "New Conversation") {
                    try {
                        const messagesResponse = await fetch(`http://localhost:5000/api/groq/messages/${selectedConversationId}`);
                        if (!messagesResponse.ok) {
                            throw new Error(`HTTP error! status: ${messagesResponse.status}`);
                        }
                        const messages = await messagesResponse.json();

                        if (messages.length <= 2) {
                            // alert("Please rename the conversation before sending messages.");
                            fetchConversationName(selectedConversationId);
                        }
                    } catch (error) {
                        console.error("Error fetching messages:", error);
                    }
                }
            }
        };

        updateConversationName();
    }, [selectedConversationId, conversations]);

    const handleTooltipOpen = (conversationId) => {
        timeoutRef.current = setTimeout(() => {
            setTooltipOpen(true);
            setTooltipConversationId(conversationId);
        }, 500);
    };

    const handleTooltipClose = () => {
        clearTimeout(timeoutRef.current);
        setTooltipOpen(false);
        setTooltipConversationId(null);
    };

    useEffect(() => {
        const handleNameUpdate = (event) => {
            console.log('Received name update event:', event.detail); // Debug log
            const { id, name, updatedAt } = event.detail;
            
            // Update main conversations list
            setConversations(prevConversations => {
                console.log('Previous conversations:', prevConversations); // Debug log
                
                const updatedConversations = prevConversations.map(conversation => {
                    if (conversation._id === id) {
                        return { 
                            ...conversation, 
                            name: name,
                            updatedAt: updatedAt || conversation.updatedAt 
                        };
                    }
                    return conversation;
                });
                
                console.log('Updated conversations:', updatedConversations); // Debug log
                
                // Sort conversations by updatedAt in descending order
                const sortedConversations = [...updatedConversations].sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );

                // Update the other lists in a separate effect to avoid race conditions
                setTimeout(() => {
                    // Update recent conversations
                    setRecentConversations(sortedConversations.slice(0, 3));

                    // Update last 24 hours conversations
                    const now = new Date();
                    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                    const last24 = sortedConversations.filter(conversation => 
                        new Date(conversation.updatedAt) >= twentyFourHoursAgo
                    );
                    setLast24HoursConversations(last24);

                    // Update history conversations
                    const history = sortedConversations.filter(conversation =>
                        !last24.find(recent => recent._id === conversation._id) &&
                        !sortedConversations.slice(0, 3).find(recent => recent._id === conversation._id)
                    );
                    setHistoryConversations(history);
                }, 0);

                return updatedConversations;
            });
        };

        window.addEventListener('conversationNameUpdated', handleNameUpdate);

        return () => {
            window.removeEventListener('conversationNameUpdated', handleNameUpdate);
        };
    }, []); // Empty dependency array since we don't need any dependencies

    // Add a new effect to monitor conversations state changes
    useEffect(() => {
        console.log('Conversations state updated:', conversations); // Debug log
    }, [conversations]);

    // Common styles that can be reused for all sections
    const conversationItemStyles = {
        padding: '6px 0px 6px 8px', // Removed left padding, kept others
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'background-color 0.2s ease',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
        width: '100%',
        position: 'relative',
    };

    const gearButtonStyles = {
        opacity: 0,
        transition: 'opacity 0.2s',
        '.MuiListItem-root:hover &': { opacity: 1 },
        position: 'absolute',
        right: '2px', // Minimal space from the right edge
        top: '50%',
        transform: 'translateY(-50%)',
        padding: 0,
        minWidth: '32px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        '&.MuiIconButton-root': {
            borderRadius: '6px',
        },
        '& .MuiTouchRipple-root': {
            borderRadius: '6px',
        },
        '&:hover': { 
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
        },
    };

    return (
        <Sheet 
            sx={{
                padding: '8px',
                width: minimized ? '52px' : '260px',
                minWidth: minimized ? '52px' : '260px',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#202123',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <Sheet 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    width: '100%', 
                    mb: 1,
                    backgroundColor: 'transparent'
                }}
            >
                <IconButton 
                    onClick={toggleMinimized} 
                    sx={{ 
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
                    }}
                >
                    <ViewSidebarOutlinedIcon />
                </IconButton>
                {!minimized && (
                    <IconButton 
                        onClick={createNewConversation}
                        sx={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
                        }}
                    >
                        <DriveFileRenameOutlineOutlinedIcon />
                    </IconButton>
                )}
            </Sheet>
            {!minimized && (
                <List className={styles.conversationList}>
                    <Typography level="body-xs" sx={{ px: 1, py: 1, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Most Recent
                    </Typography>
                    {recentConversations.map((conversation) => (
                        <ListItem
                            key={conversation._id}
                            sx={conversationItemStyles}
                            onClick={() => handleConversationClick(conversation._id)}
                        >
                            <Box sx={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center',
                                position: 'relative',
                                pr: '36px', // Adjusted to match new positioning (32px button + 2px right + 2px gap)
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    width: '100%',
                                }}>
                                    <DescriptionOutlined sx={{ 
                                        fontSize: 18, 
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        flexShrink: 0
                                    }} />
                                    <Typography 
                                        sx={{
                                            fontSize: "14px",
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: 1,
                                        }}
                                    >
                                        {conversation.name}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="sm" 
                                    variant="plain" 
                                    sx={gearButtonStyles}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add settings handler
                                    }}
                                >
                                    <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Typography level="body-xs" sx={{ px: 1, py: 1, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Last 24 Hours
                    </Typography>
                    {last24HoursConversations.map((conversation) => (
                        <ListItem
                            key={conversation._id}
                            sx={conversationItemStyles}
                            onClick={() => handleConversationClick(conversation._id)}
                        >
                            <Box sx={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center',
                                position: 'relative',
                                pr: '36px', // Adjusted to match new positioning (32px button + 2px right + 2px gap)
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    width: '100%',
                                }}>
                                    <DescriptionOutlined sx={{ 
                                        fontSize: 18, 
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        flexShrink: 0
                                    }} />
                                    <Typography 
                                        sx={{
                                            fontSize: "14px",
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: 1,
                                        }}
                                    >
                                        {conversation.name}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="sm" 
                                    variant="plain" 
                                    sx={gearButtonStyles}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add settings handler
                                    }}
                                >
                                    <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Typography level="body-xs" sx={{ px: 1, py: 1, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        History
                    </Typography>
                    {historyConversations.map((conversation) => (
                        <ListItem
                            key={conversation._id}
                            sx={conversationItemStyles}
                            onClick={() => handleConversationClick(conversation._id)}
                        >
                            <Box sx={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center',
                                position: 'relative',
                                pr: '36px', // Adjusted to match new positioning (32px button + 2px right + 2px gap)
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    width: '100%',
                                }}>
                                    <DescriptionOutlined sx={{ 
                                        fontSize: 18, 
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        flexShrink: 0
                                    }} />
                                    <Typography 
                                        sx={{
                                            fontSize: "14px",
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: 1,
                                        }}
                                    >
                                        {conversation.name}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="sm" 
                                    variant="plain" 
                                    sx={gearButtonStyles}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add settings handler
                                    }}
                                >
                                    <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
        </Sheet>
    );
}

export default SideBar;

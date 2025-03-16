import React, { useState, useEffect, useRef } from 'react';
import { 
    IconButton, 
    Sheet, 
    List, 
    ListItem, 
    Typography, 
    Box, 
    Divider, 
    Menu, 
    MenuItem, 
    Modal,
    Button,
    Tooltip
} from '@mui/joy';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'; // Paper icon
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import styles from './SideBar.module.css';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import ConfirmationModal from '../Modal/ConfirmationModal';

/**
 * Component to render the sidebar with minimize/maximize functionality and conversation list.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.minimized - Whether the sidebar is minimized or not.
 * @param {function} props.setMinimized - Function to set the minimized state.
 * @param {function} props.onConversationSelect - Function to call when a conversation is selected.
 */
const SideBar = ({ minimized, setMinimized, selectedConversationId, setSelectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipConversationId, setTooltipConversationId] = useState(null);
    const timeoutRef = useRef(null);
    const [recentConversations, setRecentConversations] = useState([]);
    const [last24HoursConversations, setLast24HoursConversations] = useState([]);
    const [historyConversations, setHistoryConversations] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuConversationId, setMenuConversationId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/groq/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setConversations(data);

            // Sort conversations by updatedAt in descending order
            const sortedConversations = [...data].sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );

            // 1. Most Recent (top 3)
            const recent = sortedConversations.slice(0, 3);
            setRecentConversations(recent);

            // 2. Last 24 Hours (excluding those in Recent)
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            const last24 = sortedConversations.filter(conversation => 
                new Date(conversation.updatedAt) >= twentyFourHoursAgo &&
                !recent.find(r => r._id === conversation._id)
            );
            setLast24HoursConversations(last24);

            // 3. History (everything else)
            const history = sortedConversations.filter(conversation =>
                !recent.find(r => r._id === conversation._id) &&
                !last24.find(r => r._id === conversation._id)
            );
            setHistoryConversations(history);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const toggleMinimized = () => {
        setMinimized((prevMinimized) => !prevMinimized);
    };

    const handleConversationClick = (conversationId) => {
        setSelectedConversationId(conversationId); // Use the prop directly
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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/groq/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: 'New Conversation' }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newConversation = await response.json();
            handleConversationClick(newConversation._id);
            await fetchConversations();
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
                        const token = localStorage.getItem('token');
                        const messagesResponse = await fetch(
                            `http://localhost:5000/api/groq/messages/${selectedConversationId}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );
                        if (!messagesResponse.ok) {
                            throw new Error(`HTTP error! status: ${messagesResponse.status}`);
                        }
                        const messages = await messagesResponse.json();

                        if (messages.length <= 2) {
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
            const { id, name, updatedAt } = event.detail;
            
            setConversations(prevConversations => {
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
                
                // Sort conversations by updatedAt in descending order
                const sortedConversations = [...updatedConversations].sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );

                // Update the lists with the same priority logic
                const recent = sortedConversations.slice(0, 3);
                setRecentConversations(recent);

                const now = new Date();
                const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                const last24 = sortedConversations.filter(conversation => 
                    new Date(conversation.updatedAt) >= twentyFourHoursAgo &&
                    !recent.find(r => r._id === conversation._id)
                );
                setLast24HoursConversations(last24);

                const history = sortedConversations.filter(conversation =>
                    !recent.find(r => r._id === conversation._id) &&
                    !last24.find(r => r._id === conversation._id)
                );
                setHistoryConversations(history);

                return updatedConversations;
            });
        };

        window.addEventListener('conversationNameUpdated', handleNameUpdate);
        return () => window.removeEventListener('conversationNameUpdated', handleNameUpdate);
    }, []); // Empty dependency array since we don't need any dependencies

    // Add a new effect to monitor conversations state changes
    useEffect(() => {
        console.log('Conversations state updated:', conversations); // Debug log
    }, [conversations]);

    const handleGearClick = (e, conversationId) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setMenuConversationId(conversationId);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuConversationId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            if (!conversationToDelete) {
                console.error("No conversation ID to delete");
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/groq/conversations/${conversationToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchConversations();
            
            if (conversationToDelete === selectedConversationId) {
                setSelectedConversationId(null);
            }
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
        setDeleteModalOpen(false);
        setConversationToDelete(null);
        handleCloseMenu();
    };

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

    const renderConversationItem = (conversation) => (
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
                pr: '36px',
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    width: '100%',
                }}>
                    <DescriptionOutlined sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Tooltip 
                        title={conversation.name}
                        placement="right"
                        arrow
                        enterDelay={500}
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            '& .MuiTooltip-arrow': {
                                color: 'rgba(0, 0, 0, 0.9)'
                            }
                        }}
                    >
                        <Typography sx={{
                            fontSize: "14px",
                            color: 'rgba(255, 255, 255, 0.9)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                            cursor: 'default'
                        }}>
                            {conversation.name}
                        </Typography>
                    </Tooltip>
                </Box>
                <IconButton 
                    size="sm" 
                    variant="plain" 
                    sx={gearButtonStyles}
                    onClick={(e) => handleGearClick(e, conversation._id)}
                >
                    <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
        </ListItem>
    );

    const menuItems = [
        {
            label: 'Delete',
            icon: <DeleteOutlineIcon />,
            onClick: () => {
                setConversationToDelete(menuConversationId);
                setDeleteModalOpen(true);
            },
            color: 'danger.plainColor',
            hoverBg: 'danger.softBg'
        }
    ];

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
                    {recentConversations.map(renderConversationItem)}
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Typography level="body-xs" sx={{ px: 1, py: 1, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Last 24 Hours
                    </Typography>
                    {last24HoursConversations.map(renderConversationItem)}
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Typography level="body-xs" sx={{ px: 1, py: 1, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        History
                    </Typography>
                    {historyConversations.map(renderConversationItem)}
                </List>
            )}
            <DropdownMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                menuItems={menuItems}
                placement="bottom-end"
            />

            <ConfirmationModal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setConversationToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Conversation"
                message="You're about to permanently delete this conversation. This action cannot be undone and all messages will be lost."
                confirmText="Delete Conversation"
                cancelText="Cancel"
                danger={true}
                conversationDetails={conversations.find(c => c._id === conversationToDelete)}
            />
        </Sheet>
    );
}

export default SideBar;

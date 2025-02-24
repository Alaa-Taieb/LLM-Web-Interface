import React, { useState, useEffect } from 'react';
import { IconButton, Sheet, List, ListItem, Typography } from '@mui/joy';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'; // Paper icon
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

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/groq/conversations');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setConversations(data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, []);

    const toggleMinimized = () => {
        setMinimized((prevMinimized) => !prevMinimized);
    };

    const handleConversationClick = (conversationId) => {
        console.log("Conversation clicked:", conversationId); // Debugging statement
        setSelectedConversationId(conversationId);
        onConversationSelect(conversationId);
    };

    return (
        <Sheet sx={{
            padding: '5px 0',
            width: minimized ? '40px' : '240px', // Adjust width based on minimized state
            transition: 'width 0.3s ease', // Add a smooth transition
            overflow: 'hidden', // Hide content when minimized
            height: '100%',
            display: 'flex',
            flexDirection: 'column', // Changed to column
            justifyContent: 'start', // Align items at the top
            alignItems: 'start',
            flexShrink: 0, // Prevent sidebar from shrinking
        }}>
            <Sheet sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 2px' }}>
                <IconButton onClick={toggleMinimized} sx={{ width: 'auto' }}>
                    <ViewSidebarOutlinedIcon />
                </IconButton>
                {!minimized && (
                    <IconButton>
                        <DriveFileRenameOutlineOutlinedIcon />
                    </IconButton>
                )}
            </Sheet>
            {!minimized && (
                <List sx={{ width: '100%', padding: 0 }}>
                    {conversations.map((conversation) => (
                        <ListItem
                            key={conversation._id}
                            sx={{ padding: '8px 8px', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}
                            onClick={() => handleConversationClick(conversation._id)}
                        >
                            <IconButton variant="plain" color="neutral" sx={{ width: '100%', justifyContent: 'flex-start' }}>
                                <DescriptionOutlined sx={{ mr: 1 }} />
                                <Typography variant='body2' sx={{fontSize: "0.9rem"}}>{conversation.name}</Typography>
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Sheet>
    );
}

export default SideBar;

import { Grid, IconButton, Sheet, Typography, Avatar } from '@mui/joy';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import { googleLogout } from '@react-oauth/google';

/**
 * Header component that displays the conversation name and user avatar
 * with dropdown menu for user actions like logout.
 *
 * @component
 * @param {Object} props
 * @param {string|null} props.selectedConversationId - ID of the currently selected conversation
 */
const Header = ({ selectedConversationId }) => {
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [conversationName, setConversationName] = useState('Start Chatting');
    const navigate = useNavigate();

    /**
     * Effect hook to fetch user data from the server
     * Decodes JWT token to get userId and fetches user details including avatar
     * 
     * @effect
     * @fires {Function} setUser - Updates user state with fetched data
     */
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
    }, []); // Empty dependency array means this runs once on mount

    /**
     * Effect hook to fetch and update conversation name when selectedConversationId changes
     * 
     * @effect
     * @fires {Function} setConversationName - Updates conversation name state
     * @dependency {string|null} selectedConversationId - Triggers fetch when changed
     */
    useEffect(() => {
        if (selectedConversationId) {
            const token = localStorage.getItem('token');
            fetch(`http://localhost:5000/api/groq/conversations/${selectedConversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                setConversationName(data.name);
            })
            .catch(err => console.error('Error fetching conversation:', err));
        } else {
            setConversationName('Start Chatting');
        }
    }, [selectedConversationId]);

    /**
     * Effect hook to listen for conversation name updates via custom events
     * 
     * @effect
     * @fires {Function} setConversationName - Updates conversation name when event is received
     * @dependency {string|null} selectedConversationId - Used to filter relevant events
     */
    useEffect(() => {
        const handleNameUpdate = (event) => {
            if (event.detail.id === selectedConversationId) {
                setConversationName(event.detail.name);
            }
        };

        window.addEventListener('conversationNameUpdated', handleNameUpdate);
        return () => window.removeEventListener('conversationNameUpdated', handleNameUpdate);
    }, [selectedConversationId]);

    /**
     * Handles click event on the avatar button to open dropdown menu
     * 
     * @callback
     * @param {React.MouseEvent} event - Click event object
     * @fires {Function} setAnchorEl - Sets the anchor element for dropdown positioning
     */
    const handleAvatarClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    /**
     * Handles closing the dropdown menu
     * 
     * @callback
     * @fires {Function} setAnchorEl - Clears the anchor element
     */
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    /**
     * Handles user logout action
     * Clears token, performs Google logout, and redirects to login page
     * 
     * @callback
     * @fires {Function} googleLogout - Logs out from Google
     * @fires {Function} setUser - Clears user state
     * @fires {Function} navigate - Redirects to login page
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        googleLogout();
        setUser(null);
        handleCloseMenu();
        navigate('/login');
    };

    const menuItems = [
        {
            label: 'Logout',
            icon: <LogoutOutlinedIcon />,
            onClick: handleLogout,
            color: 'danger.plainColor'
        }
    ];

    return (
        <Sheet 
            variant='soft' 
            color='neutral' 
            sx={{
                width: '100%',
                position: 'relative',
                zIndex: 900 // Ensure the Sheet is below the menu's z-index
            }}
        >
            <Grid container sx={{display: 'flex', alignItems: 'center', padding: '8px 16px'}}>
                <Grid xs={11}>
                    <Typography 
                        level='h6' 
                        component="div"
                        sx={{
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            paddingRight: '16px'
                        }}
                    >
                        {conversationName}
                    </Typography>
                </Grid>
                <Grid xs={1} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                    <IconButton 
                        size='lg'
                        onClick={handleAvatarClick}
                        sx={{ p: 0 }}
                    >
                        {user?.avatar ? (
                            <Avatar
                                src={user.avatar}
                                alt={user.name}
                                sx={{ width: 32, height: 32 }}
                            />
                        ) : (
                            <AccountCircleOutlinedIcon sx={{ width: 32, height: 32 }} />
                        )}
                    </IconButton>
                </Grid>
            </Grid>
            <DropdownMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                menuItems={menuItems}
                placement="bottom-end"
            />
        </Sheet>
    );
};

export default Header;

import { Grid, IconButton, Sheet, Typography, Avatar } from '@mui/joy';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import { googleLogout } from '@react-oauth/google';

const Header = ({ selectedConversationId }) => {
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [conversationName, setConversationName] = useState('Start Chatting');
    const navigate = useNavigate();

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

    useEffect(() => {
        const handleNameUpdate = (event) => {
            if (event.detail.id === selectedConversationId) {
                setConversationName(event.detail.name);
            }
        };

        window.addEventListener('conversationNameUpdated', handleNameUpdate);
        return () => window.removeEventListener('conversationNameUpdated', handleNameUpdate);
    }, [selectedConversationId]);

    const handleAvatarClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

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

import { Box, IconButton, Input, Textarea } from '@mui/joy';
import React from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
const Footer = ({setMessage , sendMessage , message}) => {

    const handleSend = e => {
        sendMessage(message);
        setMessage("");
    }
    return (
        <Box 
        component={'div'}
        sx={{ width: "100%", maxWidth: 'var(--message-width)', display: 'flex', justifyContent: 'center'}}
        >
            <Textarea
            placeholder='Type in here...'
            maxRows={3}
            size='lg'
            sx={{flexGrow: 1}}
            onChange={e => setMessage(e.target.value)}
            value={message}
            >
            </Textarea>
            <IconButton 
            size='lg'
            color='primary' onClick={e => handleSend()}>
                <ArrowCircleUpIcon/>
            </IconButton>
        </Box>
    );
}

export default Footer;

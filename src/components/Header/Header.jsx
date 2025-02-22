import { Grid, IconButton, Sheet, Typography } from '@mui/joy';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import React from 'react';

const Header = () => {
    return (
        <Sheet variant='soft' color='neutral' sx={{width: '100%'}}>
            <Grid container sx={{display: 'flex', alignItems: 'center'}}>
                <Grid xs={2}>
                    <Typography level='h6'>
                        Start Chatting
                    </Typography>
                </Grid>
                <Grid xs={9}></Grid>
                <Grid xs={1} sx={{display: 'flex', justifyContent: "end"}}>
                    <IconButton size='lg'>
                        <AccountCircleOutlinedIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Sheet>
    );
}

export default Header;

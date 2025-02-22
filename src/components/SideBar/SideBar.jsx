import { Grid, IconButton, Sheet } from '@mui/joy';
import React from 'react';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
const SideBar = () => {
    return (
        <Sheet sx={{padding: '5px'}}>
            <Grid container>
                <Grid xs={2}>
                    <IconButton >
                        <ViewSidebarOutlinedIcon />
                    </IconButton>
                </Grid>
                <Grid xs={8}></Grid>
                <Grid xs={2}>
                    <IconButton>
                        <DriveFileRenameOutlineOutlinedIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Sheet>
    );
}

export default SideBar;

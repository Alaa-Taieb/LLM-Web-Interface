import React from 'react';
import { Grid, IconButton, Sheet } from '@mui/joy';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

/**
 * Component to render the sidebar with minimize/maximize functionality.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.minimized - Whether the sidebar is minimized or not.
 * @param {function} props.setMinimized - Function to set the minimized state.
 */
const SideBar = ({ minimized, setMinimized }) => {
    const toggleMinimized = () => {
        setMinimized((prevMinimized) => !prevMinimized);
    };

    return (
        <Sheet sx={{
            padding: '5px 0',
            width: minimized ? '40px' : '240px', // Adjust width based on minimized state
            transition: 'width 0.3s ease', // Add a smooth transition
            overflow: 'hidden', // Hide content when minimized
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'start',
            flexShrink: 0, // Prevent sidebar from shrinking
        }}>
            <IconButton onClick={toggleMinimized} sx={{ width: 'auto' }}>
                <ViewSidebarOutlinedIcon />
            </IconButton>
            {!minimized && ( // Conditionally render the other button
                <IconButton>
                    <DriveFileRenameOutlineOutlinedIcon />
                </IconButton>
            )}
        </Sheet>
    );
}

export default SideBar;

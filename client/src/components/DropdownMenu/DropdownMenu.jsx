import React from 'react';
import { Menu, MenuItem } from '@mui/joy';
import { ClickAwayListener } from '@mui/base';

/**
 * Reusable dropdown menu component that can be used throughout the application.
 * 
 * @param {Object} props
 * @param {HTMLElement} props.anchorEl - The element to anchor the menu to
 * @param {boolean} props.open - Whether the menu is open
 * @param {function} props.onClose - Function to call when the menu closes
 * @param {Array} props.menuItems - Array of menu items with their properties
 * @param {string} props.placement - Menu placement (e.g., 'bottom-end', 'bottom-start', etc.)
 */
const DropdownMenu = ({ 
    anchorEl, 
    open, 
    onClose, 
    menuItems,
    placement = 'bottom-end' 
}) => {
    return (
        <ClickAwayListener onClickAway={onClose}>
            <div>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={onClose}
                    placement={placement}
                    variant="outlined"
                    slotProps={{
                        root: {
                            onClick: (e) => e.stopPropagation(),
                        },
                    }}
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 4],
                            },
                        },
                    ]}
                    sx={{
                        minWidth: 180,
                        '--Menu-decoration-offset': '8px',
                        '--Menu-radius': '8px',
                        '--List-radius': '6px',
                        '--List-padding': '4px',
                        '--ListItem-minHeight': '32px',
                        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 15px',
                        backgroundColor: '#2F2F2F',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 1000,
                    }}
                >
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                item.onClick();
                                onClose();
                            }}
                            sx={{
                                fontSize: '14px',
                                py: '6px',
                                px: '12px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: item.color || '#ffffff',
                                '&:hover': {
                                    backgroundColor: '#424242',
                                    color: item.color || '#ffffff',
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: '16px',
                                    color: 'inherit'
                                }
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        </ClickAwayListener>
    );
};

export default DropdownMenu;
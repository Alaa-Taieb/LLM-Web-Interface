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
                        minWidth: 200,
                        '--Menu-decoration-offset': '8px',
                        '--Menu-radius': '12px',
                        '--List-radius': '8px',
                        '--List-padding': '6px',
                        '--ListItem-minHeight': '40px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        backgroundColor: '#202123',
                        border: '1px solid #2F2F2F',
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
                                py: '8px',
                                px: '16px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#E0E0E0',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#2F2F2F',
                                    color: '#FFFFFF',
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: '20px',
                                    color: '#808080',
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

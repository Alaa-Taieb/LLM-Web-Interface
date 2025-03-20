import React from 'react';
import { Menu, MenuItem } from '@mui/joy';
import { ClickAwayListener } from '@mui/base';

/**
 * Reusable dropdown menu component that can be used throughout the application.
 * Provides a styled menu with customizable items and click-away behavior.
 * 
 * @component
 * @param {Object} props
 * @param {HTMLElement} props.anchorEl - The DOM element to anchor the menu to
 * @param {boolean} props.open - Whether the menu is currently open
 * @param {function} props.onClose - Callback function to handle menu closing
 * @param {Array<MenuItemProps>} props.menuItems - Array of menu items to display
 * @param {string} [props.placement='bottom-end'] - Menu placement relative to anchor element
 * 
 * @typedef {Object} MenuItemProps
 * @property {string} label - Text to display for the menu item
 * @property {React.ReactElement} icon - Icon component to display before the label
 * @property {function} onClick - Callback function when item is clicked
 * @property {string} [color] - Optional color for the menu item (e.g., 'danger.plainColor')
 * @property {string} [hoverBg] - Optional background color for hover state
 * 
 * @example
 * const menuItems = [
 *   {
 *     label: 'Delete',
 *     icon: <DeleteIcon />,
 *     onClick: handleDelete,
 *     color: 'danger.plainColor'
 *   }
 * ];
 * 
 * <DropdownMenu
 *   anchorEl={anchorElement}
 *   open={isOpen}
 *   onClose={handleClose}
 *   menuItems={menuItems}
 *   placement="bottom-start"
 * />
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
                            onClick: (e) => e.stopPropagation(), // Prevent event bubbling
                        },
                    }}
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 4], // [horizontal, vertical] offset
                            },
                        },
                    ]}
                    sx={{
                        // Menu container styles
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
                                e.stopPropagation(); // Prevent event bubbling
                                item.onClick();
                                onClose();
                            }}
                            sx={{
                                // Menu item styles
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

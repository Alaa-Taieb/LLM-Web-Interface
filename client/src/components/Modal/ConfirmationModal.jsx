import React from 'react';
import { Modal, Sheet, Typography, Button, Box, Divider } from '@mui/joy';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

/**
 * A reusable confirmation modal component that can be used for various confirmation dialogs
 * including dangerous actions. Supports displaying conversation details when relevant.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Controls the visibility of the modal
 * @param {Function} props.onClose - Callback function when modal is closed
 * @param {Function} props.onConfirm - Callback function when action is confirmed
 * @param {string} props.title - Title text displayed in the modal header
 * @param {string} props.message - Main message content of the modal
 * @param {string} [props.confirmText="Confirm"] - Text for the confirm button
 * @param {string} [props.cancelText="Cancel"] - Text for the cancel button
 * @param {boolean} [props.danger=false] - If true, styles the modal with danger/warning colors
 * @param {Object} [props.conversationDetails=null] - Optional conversation details to display
 * @param {string} props.conversationDetails.name - Name of the conversation
 * @param {string} props.conversationDetails.createdAt - Creation timestamp of the conversation
 * 
 * @example
 * // Basic usage
 * <ConfirmationModal
 *   open={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onConfirm={handleConfirm}
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 * />
 * 
 * @example
 * // Usage with danger styling and conversation details
 * <ConfirmationModal
 *   open={isDeleteModalOpen}
 *   onClose={handleClose}
 *   onConfirm={handleDelete}
 *   title="Delete Conversation"
 *   message="This action cannot be undone."
 *   danger={true}
 *   confirmText="Delete"
 *   conversationDetails={{
 *     name: "My Conversation",
 *     createdAt: "2024-01-01T00:00:00Z"
 *   }}
 * />
 */
const ConfirmationModal = ({ 
    open, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    conversationDetails = null
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Sheet
                variant="outlined"
                sx={{
                    maxWidth: '500px',
                    width: '95%',
                    borderRadius: '16px',
                    boxShadow: 'lg',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                }}
            >
                {/* Header Section */}
                <Box
                    sx={{
                        backgroundColor: '#202020',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2.5,
                    }}
                >
                    {danger && (
                        <Box
                            sx={{
                                backgroundColor: '#2C1518',
                                borderRadius: '12px',
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <WarningRoundedIcon 
                                sx={{ 
                                    color: '#FF4545',
                                    fontSize: '2rem'
                                }}
                            />
                        </Box>
                    )}
                    <Typography 
                        level="h4"
                        sx={{ 
                            color: '#FFFFFF',
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            letterSpacing: '-0.025em',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Content Section */}
                <Box sx={{ p: 3.5 }}>
                    <Typography 
                        level="body-md"
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: '1.7',
                            fontSize: '1.05rem',
                            mb: conversationDetails ? 3 : 0
                        }}
                    >
                        {message}
                    </Typography>

                    {conversationDetails && (
                        <Box
                            sx={{
                                mt: 3,
                                p: 2.5,
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ChatOutlinedIcon 
                                    sx={{ 
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        mr: 1.5,
                                        fontSize: '1.2rem'
                                    }} 
                                />
                                <Typography
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '1.1rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    {conversationDetails.name}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon 
                                    sx={{ 
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        mr: 1.5,
                                        fontSize: '1.2rem'
                                    }} 
                                />
                                <Typography
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Created {formatDistanceToNow(new Date(conversationDetails.createdAt))} ago
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Actions Section */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'flex-end',
                    p: 2.5,
                    backgroundColor: '#202020',
                }}>
                    <Button
                        variant="plain"
                        color="neutral"
                        onClick={onClose}
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            px: 3,
                            py: 1,
                            color: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': { 
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="solid"
                        onClick={onConfirm}
                        sx={{
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            px: 3,
                            py: 1,
                            backgroundColor: danger ? '#E11D48' : '#3B82F6',
                            color: '#FFFFFF',
                            '&:hover': {
                                backgroundColor: danger ? '#BE123C' : '#2563EB',
                            }
                        }}
                    >
                        {confirmText}
                    </Button>
                </Box>
            </Sheet>
        </Modal>
    );
};

export default ConfirmationModal;

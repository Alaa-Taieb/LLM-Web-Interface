import { useContext, useState, useEffect } from 'react';
import React, { forwardRef } from 'react';
import GroqContext from '../GroqContext';
import styles from './APIForm.module.css';
import Groq from 'groq-sdk';
import Card from '@mui/joy/Card';
import AspectRatio from '@mui/joy/AspectRatio';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Button from '@mui/joy/Button';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Sheet from '@mui/joy/Sheet';
import { FormControl, FormHelperText, FormLabel, Grid, IconButton, Input } from '@mui/joy';
import APIKeyTutorial from '../APIKeyTutorial/APIKeyTutorial';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CircularProgress from '@mui/joy/CircularProgress';

/**
 * Tests the Groq API connection with a simple chat completion request
 * @async
 * @param {Groq} groq - Initialized Groq client instance
 * @returns {Promise<Object>} Chat completion response
 * @throws {Error} If API request fails
 */
export async function getGroqChatCompletion(groq) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Test",
            },
        ],
        model: "llama3-8b-8192",
    });
}

/**
 * APIForm component provides a form for managing Groq API key configuration.
 * Features:
 * - API key input and validation
 * - Interactive tutorial for key generation
 * - Secure key storage
 * - Visual feedback for validation status
 * - Error handling and display
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the form modal
 * @param {React.Ref} ref - Forwarded ref for the form component
 * @returns {JSX.Element} Rendered APIForm component
 * 
 * @example
 * <APIForm 
 *   onClose={() => setShowForm(false)} 
 *   ref={formRef}
 * />
 */
const APIForm = forwardRef(({ onClose, ...props }, ref) => {
    /**
     * State Management
     * @type {[string, Function]} APIValid - Validation status of the API key
     * @type {[string, Function]} error - Error message if validation fails
     * @type {[boolean, Function]} tutorialOpen - Controls tutorial modal visibility
     * @type {[string, Function]} apiKey - Current API key value
     * @type {[Object, Function]} groq - Groq context for global state
     */
    const [APIValid, setAPIValid] = useState("false");
    const [error, setError] = useState("");
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [groq, setGroq] = useContext(GroqContext);
    const [isVerifying, setIsVerifying] = useState(false);

    /**
     * Verifies the API key by making a test request to Groq API
     * Updates validation state and error messages accordingly
     */
    const verifyAPIKey = async () => {
        setIsVerifying(true);
        const g = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
        try {
            await getGroqChatCompletion(g);
            setAPIValid("true");
            setError("");
        } catch (err) {
            setError("Invalid API Key.");
            setAPIValid("false");
        } finally {
            setIsVerifying(false);
        }
    };

    /**
     * Handles form submission by saving the validated API key
     * @async
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (APIValid === "true") {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/keys', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: 'Default Key',
                        key: apiKey
                    })
                });

                if (response.ok) {
                    setGroq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
                    onClose();
                } else {
                    setError('Failed to save API key');
                }
            } catch (error) {
                console.error('Error saving API key:', error);
                setError('Failed to save API key');
            }
        }
    };

    return (
        <div className={styles.container}>
            <Card
                orientation="horizontal"
                variant="soft"
                color='neutral'
                sx={{ width: 700 }}
            >
                <CardOverflow>
                    <AspectRatio ratio={100/465} sx={{ width: 100, height: 465 }}>
                        <img 
                            src="assets\API_Card_OverFlow_Start.webp" 
                            alt="API Setup Illustration" 
                            loading='lazy' 
                            style={{ width: "100%", height: "500px" }} 
                        />
                    </AspectRatio>
                </CardOverflow>
                <CardContent>
                    <Typography level='h2'>Setup API Key</Typography>
                    <CardContent orientation='vertical' sx={{ textAlign: 'start' }}>
                        <Typography level='title-lg'>Why?</Typography>
                        <Typography level='body-sm'>
                            This application uses Groq AI model through their public APIs.
                            Their APIs require an API key to function.
                        </Typography>
                        <Typography level='title-lg'>How?</Typography>
                        <Typography level='body-sm'>
                            You can get a Groq API Key by following these steps:
                            <List marker='decimal'>
                                <ListItem>
                                    <Typography level='body-sm'>Create an account at </Typography>
                                    <Button
                                        target='_blank'
                                        component="a"
                                        href='https://groq.com/'
                                        size='sm'
                                        variant='outlined'
                                        color='neutral'
                                        startDecorator={<OpenInNew />}
                                    >
                                        Groq
                                    </Button>
                                </ListItem>
                                <ListItem>
                                    <Typography level='body-sm'>Generate an API Key and copy it somewhere safe </Typography>
                                    <Button
                                        variant='outlined'
                                        size='sm'
                                        color='neutral'
                                        startDecorator={<InfoOutlinedIcon />}
                                        onClick={() => setTutorialOpen(true)}
                                    >
                                        Tutorial
                                    </Button>
                                    <Modal
                                        open={tutorialOpen}
                                        onClose={() => setTutorialOpen(false)}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Sheet variant="outlined" sx={{ width: 1000, minWidth: 300, borderRadius: 'md', p: 3 }}>
                                            <ModalClose />
                                            <APIKeyTutorial closeModal={() => setTutorialOpen(false)} />
                                        </Sheet>
                                    </Modal>
                                </ListItem>
                                <ListItem>
                                    <Typography level='body-sm'>
                                        Paste your API key in the textfield below.
                                    </Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography level='body-sm'>
                                        Verify it using the green icon.
                                    </Typography>
                                </ListItem>
                                <ListItem>
                                    <Typography level='body-sm'>
                                        Save it using the Save Button.
                                    </Typography>
                                </ListItem>
                            </List>
                        </Typography>
                    </CardContent>
                    <CardContent>
                        <Grid container>
                            <Grid xs={12}>
                                <form onSubmit={handleSubmit}>
                                    <FormControl error={Boolean(error)}>
                                        <Input 
                                            type='password' 
                                            name='api_key' 
                                            color={APIValid === "true" ? 'success' : 'neutral'} 
                                            size='md' 
                                            placeholder='Insert your API Key here ...' 
                                            onChange={e => {
                                                setApiKey(e.target.value);
                                                if (APIValid === "true")
                                                    setAPIValid("false");
                                            }} 
                                            endDecorator={
                                                isVerifying ? (
                                                    <CircularProgress size="sm" />
                                                ) : APIValid === "true" ? (
                                                    <IconButton 
                                                        type="submit"
                                                        color='success'
                                                    >
                                                        <SaveOutlinedIcon />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton 
                                                        onClick={verifyAPIKey}
                                                        color='neutral'
                                                    >
                                                        <CheckCircleOutlineOutlinedIcon />
                                                    </IconButton>
                                                )
                                            }
                                        />
                                        {error && <FormHelperText>{error}</FormHelperText>}
                                    </FormControl>
                                </form>
                            </Grid>
                        </Grid>
                    </CardContent>
                </CardContent>
            </Card>
        </div>
    );
});

export default APIForm;

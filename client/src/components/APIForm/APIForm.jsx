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
import Button from '@mui/joy/Button'
import OpenInNew from '@mui/icons-material/OpenInNew';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Sheet from '@mui/joy/Sheet';
import { FormControl, FormHelperText, FormLabel, Grid, IconButton, Input } from '@mui/joy';
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepButton from '@mui/joy/StepButton';
import StepIndicator from '@mui/joy/StepIndicator';
import APIKeyTutorial from '../APIKeyTutorial/APIKeyTutorial';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

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

const APIForm = forwardRef(({ onClose, ...props }, ref) => {
    const [APIValid, setAPIValid] = useState("false");
    const [error, setError] = useState("");
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [groq, setGroq] = useContext(GroqContext);

    const verifyAPIKey = () => {
        const g = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
        getGroqChatCompletion(g)
            .then(() => { 
                setAPIValid("true"); 
                setError(""); 
            })
            .catch(err => {
                setError("Invalid API Key.");
                setAPIValid("false");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (APIValid === "true") {
            setGroq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
            onClose();
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
                        <img src="assets\API_Card_OverFlow_Start.webp" alt="" loading='lazy' style={{ width: "100%", height: "500px" }} />
                    </AspectRatio>
                </CardOverflow>
                <CardContent>
                    <Typography level='h2'>Setup API Key</Typography>
                    <CardContent orientation='vertical' sx={{ textAlign: 'start' }}>
                        <Typography level='title-lg'>Why?</Typography>
                        <Typography level='body-sm'>
                            This application uses Groq AI model through their public Apis.
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
                                        startDecorator={<OpenInNew />}>
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
                                        onClick={() => setTutorialOpen(true)}>
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
                                        Paste your API key in the textfield blow.
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
                                            color={APIValid == "true" ? 'success' : APIValid == "false" ? 'neutral' : "neutral"} 
                                            size='md' 
                                            placeholder='Insert your API Key here ...' 
                                            onChange={e => {
                                                setApiKey(e.target.value);
                                                if (APIValid == "true")
                                                    setAPIValid("false")
                                            }} 
                                            endDecorator={
                                                <>
                                                    {
                                                        (APIValid == "false") || (APIValid == "checking") ?
                                                            <IconButton color='success' loading={APIValid=="checking"} onClick={(e) => {setAPIValid("checking"); verifyAPIKey()}}>
                                                                <CheckCircleOutlineOutlinedIcon />
                                                            </IconButton>
                                                        : APIValid == "true" ?
                                                            <Button type='submit' startDecorator={<SaveOutlinedIcon />}>
                                                                Save
                                                            </Button>
                                                        : ""
                                                    }
                                                </>
                                            } 
                                        />
                                        {error &&
                                            <FormHelperText>
                                                <InfoOutlinedIcon />
                                                {error}
                                            </FormHelperText>
                                        }
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
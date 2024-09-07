import { useContext, useState } from 'react';
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


/**
 * This function is used to fetch completion suggestions from the Groq AI model using their public APIs.
 * 
 * @param {Groq} groq - An instance of the Groq SDK, initialized with the user's API key.
 * @returns {Promise<any>} - A Promise that resolves to the completion suggestions from the Groq AI model.
 * 
 * @throws Will throw an error if the Groq API request fails or if the API key is invalid.
 * 
 * @example
 * const g = new Groq({ apiKey: 'your_api_key', dangerouslyAllowBrowser: true });
 * getGroqChatCompletion(g)
 *   .then(response => console.log(response))
 *   .catch(error => console.error(error));
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
 * This functional component represents a form for setting up an API key for the Groq AI model.
 * It includes a step-by-step guide on how to obtain an API key, input field for the API key,
 * and buttons for verifying and saving the API key.
 *
 * @returns {React.ReactElement} - The rendered component.
 */
const APIForm = () => {

    // State variable to track the validity of the API key. Initially set to false.
    const [APIValid, setAPIValid] = useState(false);

    // State variable to track any error messages related to the API key. Initially set to an empty string.
    const [error, setError] = useState("");

    // State variable to track whether the tutorial modal is open or closed. Initially set to false.
    const [tutorialOpen, setTutorialOpen] = useState(false);

    // State for managing the API key input by the user
    const [apiKey, setApiKey] = useState("");

    // Access and destructure Groq-related state and updater functions from the GroqContext
    const [groq, setGroq, , setGroqObject] = useContext(GroqContext);

    /**
     * Function to verify the API key by making a request to the Groq API and updating the state variables accordingly.
     * 
     * @function verifyAPIKey
     * 
     * @returns {void}
     */
    const verifyAPIKey = () => {
        const g = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
        getGroqChatCompletion(g)
            .then(() => { setAPIValid(true); setError("") })
            .catch(err => {
                setError("Invalid API Key.")
            })
    }

    // Effect to initialize the Groq object when the groq state changes
    useState(() => {
        setGroqObject(new Groq(groq));
    }, [groq])

    /**
     * Handles form submission to update the Groq context with the provided API key.
     * 
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setGroq({ ...groq, apiKey: apiKey });
    }

    return (
        <div className={styles.container}>
            <Card
                orientation="horizontal"
                variant="soft"
                color='neutral'
                sx={
                    {
                        width: 700
                    }
                }
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
                                    <FormControl error={error}>
                                        {/* <FormLabel>API Key</FormLabel> */}
                                        <Input type='password' color={APIValid ? 'success' : 'neutral'} onChange={e => {
                                            setApiKey(e.target.value);
                                            if (APIValid)
                                                setAPIValid(false)
                                        }
                                        } size='md' placeholder='Insert your API Key here ...' endDecorator={
                                            <>
                                                {!APIValid ?
                                                    <IconButton color='success' onClick={(e) => verifyAPIKey()}>
                                                        <CheckCircleOutlineOutlinedIcon />
                                                    </IconButton>
                                                    :
                                                    <Button type='submit' startDecorator={<SaveOutlinedIcon />}>
                                                        Save
                                                    </Button>
                                                }
                                            </>
                                        } />
                                        {error ?
                                            <FormHelperText>
                                                <InfoOutlinedIcon />
                                                {error}
                                            </FormHelperText> :
                                            ""
                                        }
                                    </FormControl>
                                </form>
                            </Grid>
                        </Grid>
                    </CardContent>

                </CardContent>
            </Card>
        </div>
    )
}
export default APIForm;
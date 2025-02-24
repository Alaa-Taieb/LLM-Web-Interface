// Importing required components and icons from Material UI and React
import Step, { stepClasses } from '@mui/joy/Step';
import StepIndicator, { stepIndicatorClasses } from '@mui/joy/StepIndicator';
import Typography from '@mui/joy/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, Grid } from '@mui/joy';
import Stepper from '@mui/joy/Stepper';
import { useEffect, useState } from 'react';
import Button from '@mui/joy/Button'
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Define the steps of the API key creation process
const steps =
    [
        { title: "Navigate", order: 1 },
        { title: "Create API Key", order: 2 },
        { title: "Name It", order: 3 },
        { title: "Copy", order: 4 },
    ];

// Define the information associated with each step
const information =
    [
        {
            hint:
                (
                    <>
                        <Typography level='body-sm' >
                            This is the page you will be faced with when you login.
                        </Typography>
                        <Typography level='body-sm' variant='soft' color='primary' sx={{ fontWeight: 'bold' }} startDecorator={<InfoOutlinedIcon />}>
                            Click on the API Keys menu link.
                        </Typography>
                    </>
                ),
            img: (
                <>
                    <img src="/assets/API_KEY_CREATION_PROCESS/STEP_1.png" alt="" width={"100%"} />
                </>
            )
        },
        {
            hint:
                (
                    <>
                        <Typography level='body-sm' >
                            In this page you will be able to manage all you API keys.
                        </Typography>
                        <Typography level='body-sm' variant='soft' color='primary' sx={{ fontWeight: 'bold' }} startDecorator={<InfoOutlinedIcon />}>
                            Click on the Create API Key button.
                        </Typography>
                    </>
                ),
            img: (
                <>
                    <img src="/assets/API_KEY_CREATION_PROCESS/STEP_2.png" alt="" width={"100%"} />
                </>
            )
        },
        {
            hint:
                (
                    <>
                        <Typography level='body-sm' >
                            This form will allow you to name your API key, This is useful if you are planning on creating multiple keys for different uses.
                        </Typography>
                        <Typography level='body-sm' variant='soft' color='primary' sx={{ fontWeight: 'bold' }} startDecorator={<InfoOutlinedIcon />}>
                            Insert a name for your API key and click Submit.
                        </Typography>
                        <Typography level='body-sm' variant='soft' color='warning' sx={{ fontWeight: 'bold' }} startDecorator={<InfoOutlinedIcon />}>
                            We do not save your API keys, they are stored on your browser's cookies
                        </Typography>
                    </>
                ),
            img: (
                <>
                    <img src="/assets/API_KEY_CREATION_PROCESS/STEP_3.png" alt="" width={"100%"} />
                </>
            )
        },
        {
            hint:
                (
                    <>
                        <Typography level='body-sm' >
                            Here you will be presented with an API key generated from Groq's servers.
                        </Typography>
                        <Typography level='body-sm' variant='soft' color='primary' sx={{ fontWeight: 'bold' }} startDecorator={<InfoOutlinedIcon />}>
                            Click the Copy button and paste your key somewhere safe in your computer.
                        </Typography>
                        <Typography level='body-sm' variant='soft' color='warning' sx={{ fontWeight: 'bold' }} startDecorator={<InfoOutlinedIcon />}>
                            This is the last time you will see your key, so you better save it!
                        </Typography>
                    </>
                ),
            img: (
                <>
                    <img src="/assets/API_KEY_CREATION_PROCESS/STEP_4.png" alt="" width={"100%"} />
                </>
            )
        }
    ]

/**
 * APIKeyTutorial component
 * Displays a multi-step tutorial for API key creation using a stepper UI.
 * 
 * @param {function} closeModal - Function to close the tutorial modal
 */
const APIKeyTutorial = ({ closeModal }) => {
    // Current step in the tutorial
    const [cStep, setCStep] = useState(1); 

    // Offset for stepper line styles
    const [lineBottomOffset, setLineBottomOffset] = useState(0);

    // Set an initial bottom offset for the stepper line after the component mounts
    useEffect(() => {
        setLineBottomOffset(10);
    }, [])
    return (
        <Grid container columns={12} spacing={2} >
            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography level='h2' >
                    Tutorial
                </Typography>
            </Grid>
            <Grid xs={12}>
                <Stepper
                    sx={{
                        width: '100%',
                        [`& .${stepClasses.root}`]: {
                            flexDirection: 'column-reverse',
                            '&::after': {
                                top: 'unset',
                                bottom:
                                    `${lineBottomOffset}px`,
                            },
                        },
                        [`& .${stepClasses.completed}::after`]: {
                            bgcolor: 'primary.500',
                        },
                        [`& .${stepClasses.active} .${stepIndicatorClasses.root}`]: {
                            borderColor: 'primary.500',
                        },
                        [`& .${stepClasses.root}:has(+ .${stepClasses.active})::after`]: {
                            color: 'primary.500',
                            backgroundColor: 'transparent',
                            backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)',
                            backgroundSize: '7px 7px',
                            backgroundPosition: 'center left',
                        },
                        [`& .${stepClasses.disabled} *`]: {
                            color: 'neutral.plainDisabledColor',
                        },
                    }}
                >
                    {steps.map(step => {
                        return (
                            <Step
                                active={step.order == cStep}
                                completed={step.order < cStep}
                                disabled={step.order > cStep}
                                orientation='vertical'
                                indicator={
                                    cStep > step.order ?
                                        (
                                            <StepIndicator variant="solid" color="primary">
                                                <CheckRoundedIcon />
                                            </StepIndicator>

                                        ) :
                                        cStep == step.order ?
                                            (
                                                <StepIndicator variant="outlined" color="primary">
                                                    <KeyboardArrowDownRoundedIcon />
                                                </StepIndicator>
                                            ) :
                                            (<StepIndicator variant="outlined" color="neutral" />)

                                }
                            >
                                <Typography
                                    level="h4"
                                    endDecorator={
                                        <Typography sx={{ fontSize: 'sm', fontWeight: 'normal' }}>
                                            {step.title}
                                        </Typography>
                                    }
                                    sx={{ fontWeight: 'xl' }}
                                >
                                    {`0${step.order}`}
                                </Typography>
                            </Step>
                        )
                    })}

                </Stepper>
            </Grid>

            <Grid container xs={12} >
                <Grid xs={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box component="section" sx={{ p: 2, border: "1px dashed grey", width: "100%" }}>
                        <Grid xs={12} sx={{ display: "flex", justifyContent: 'center' }}>
                            <Typography level='h3' >
                                Hint
                            </Typography>
                        </Grid>
                        <Grid xs={12} sx={{ display: "flex", flexDirection: 'column', alignItems: 'start' }}>
                            {information[cStep - 1].hint}
                        </Grid>
                    </Box>
                </Grid>
                <Grid xs={9}>
                    {information[cStep - 1].img}
                </Grid>

            </Grid>
            <Grid container xs={12}>
                <Grid xs={2}>
                    <Button disabled={cStep == 1} sx={{ width: '100%' }} startDecorator={<ArrowCircleLeftOutlinedIcon />} onClick={() => setCStep(cStep - 1)}>
                        Previous Step
                    </Button>
                </Grid>
                <Grid xs={8} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {cStep == steps.length ?
                        (
                            <Button color='success' sx={{ width: '50%' }} onClick={closeModal}>
                                Finish
                            </Button>
                        ) : ""
                    }
                </Grid>
                <Grid xs={2}>
                    <Button disabled={cStep == steps.length} sx={{ width: '100%' }} endDecorator={<ArrowCircleRightOutlinedIcon />} onClick={() => setCStep(cStep + 1)}>
                        Next Step
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default APIKeyTutorial;

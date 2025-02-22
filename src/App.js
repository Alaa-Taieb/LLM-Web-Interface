import './App.css';
import ChatApp from './components/ChatApp/ChatApp';
import GroqContext from './components/GroqContext';
import { useContext, useEffect, useState } from 'react';
import APIForm from './components/APIForm/APIForm';
import { useColorScheme } from '@mui/joy/styles';
import { Grid, Modal, Sheet } from '@mui/joy';
import SideBar from './components/SideBar/SideBar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HandleMessages from './utils/HandleMessages';
import Groq from 'groq-sdk';
/**
 * The main application component.
 * This component renders the ChatApp component if the API key is provided,
 * otherwise, it renders the APIForm component.
 *
 * @returns {JSX.Element} - The rendered component.
 * **/
function App() {
  // Import and utilize the useColorScheme hook from '@mui/joy/styles' to manage the color scheme (light/dark mode)
  const {mode , setMode} = useColorScheme();
  setMode("dark");
  // Initialize and manage the 'groq' state object, which contains the API key and other relevant information
  const [groq , setGroq] = useState({ apiKey: "" , dangerouslyAllowBrowser: true})

  const [openAPIFormModal, setOpenAPIFormModal] = useState(true);

    // // Retrieve the Groq instance from context to be used in message handling
    // const [groqC] = useContext(GroqContext);
      
    // State hook for managing the current input message
    const [message , setMessage] = useState("");
    
    // Destructure the messages array and sendMessage function from the HandleMessages utility
    const {messages , sendMessage} = HandleMessages(new Groq(groq));

  useEffect(() => {
    setOpenAPIFormModal(groq.apiKey === "");
  }, []);
  
  // Fetch the Groq object from the provided API key using the useEffect hook
  const [groqObject , setGroqObject] = useState();

  return (
    <Sheet component='div' sx={{overflow: 'auto'}}>
      <GroqContext.Provider value={[groq , setGroq , groqObject , setGroqObject]}>
        <Modal open={openAPIFormModal}>
          <APIForm setOpenAPIFormModal={setOpenAPIFormModal}/>
        </Modal>
        <Grid container>
          {/* Side Bar */}
          <Grid xs={2} sx={{height: "100vh"}}>
            <SideBar />
          </Grid>
          {/* Messaging Side */}
          <Grid xs={10} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
            <Sheet sx={{width: '100%' ,padding: '5px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'start', flexGrow: 1 }} color='neutral' variant='soft'>
              <Header />
              <ChatApp message={message} setMessage={setMessage} messages={messages} sendMessage={sendMessage}/>
            </Sheet>
            <Footer setMessage={setMessage} sendMessage={sendMessage} message={message}/>
          </Grid>
        </Grid>
      </GroqContext.Provider>
    </Sheet>
  );
}

export default App;

import './App.css';
import ChatApp from './components/ChatApp/ChatApp';
import GroqContext from './components/GroqContext';
import { useContext, useEffect, useState } from 'react';
import APIForm from './components/APIForm/APIForm';
import { useColorScheme } from '@mui/joy/styles';
import { Modal, Sheet, Box } from '@mui/joy';
import SideBar from './components/SideBar/SideBar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HandleMessages from './utils/HandleMessages';
import Groq from 'groq-sdk';

function App() {
  const { mode, setMode } = useColorScheme();
  setMode("dark");
  const [groq, setGroq] = useState({ apiKey: "", dangerouslyAllowBrowser: true });
  const [openAPIFormModal, setOpenAPIFormModal] = useState(true);
  const [message, setMessage] = useState("");
  const { messages, sendMessage, isSending, setIsSending } = HandleMessages(new Groq(groq));
  useEffect(() => {
    setOpenAPIFormModal(groq.apiKey === "");
  }, []);
  const [groqObject, setGroqObject] = useState();
  const [minimized, setMinimized] = useState(false);

  return (
    <Sheet component='div' sx={{ overflow: 'auto', height: '100vh', display: 'flex' }}> {/* Use flexbox for main layout */}
      <GroqContext.Provider value={[groq, setGroq, groqObject, setGroqObject]}>
        <Modal open={openAPIFormModal}>
          <APIForm setOpenAPIFormModal={setOpenAPIFormModal} />
        </Modal>
        <SideBar minimized={minimized} setMinimized={setMinimized} />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}> {/* Messaging side takes remaining space */}
          <Sheet sx={{ width: '100%', height: '100vh',padding: '5px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', flexGrow: 1 }} color='neutral' variant='soft'>
            <Header />
            <ChatApp message={message} setMessage={setMessage} messages={messages} sendMessage={sendMessage} />
            <Footer setMessage={setMessage} sendMessage={sendMessage} message={message} isSending={isSending} setIsSending={setIsSending} />
          </Sheet>
        </Box>
      </GroqContext.Provider>
    </Sheet>
  );
}

export default App;

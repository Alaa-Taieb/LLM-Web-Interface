import './App.css';
import ChatApp from './components/ChatApp/ChatApp';
import GroqContext from './components/GroqContext';
import { useEffect, useState } from 'react';
import APIForm from './components/APIForm/APIForm';
import { useColorScheme } from '@mui/joy/styles';
import { Modal, Sheet, Box } from '@mui/joy';
import SideBar from './components/SideBar/SideBar';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HandleMessages from './utils/HandleMessages';
import Groq from 'groq-sdk';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// import 'dotenv/config';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

// Main Chat Component
const ChatComponent = () => {
    const { mode, setMode } = useColorScheme();
    setMode("dark");
    const [groq, setGroq] = useState({ apiKey: "", dangerouslyAllowBrowser: true });
    const [openAPIFormModal, setOpenAPIFormModal] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [groqObject, setGroqObject] = useState();
    const [minimized, setMinimized] = useState(false);
    
    const { 
        messages, 
        sendMessage, 
        isSending, 
        setIsSending, 
        clearMessages, 
        updateMessages 
    } = HandleMessages(new Groq(groq), selectedConversationId);

    const handleMessageSend = async (messageContent) => {
        if (!messageContent.trim()) return;
        await sendMessage(messageContent);
    };

    useEffect(() => {
        setOpenAPIFormModal(groq.apiKey === "");
    }, [groq.apiKey]);

    const handleConversationSelect = async (conversationId) => {
        console.log("Conversation selected in App:", conversationId);
        setSelectedConversationId(conversationId);
        clearMessages();
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/groq/messages/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const fetchedMessages = await response.json();
                updateMessages(fetchedMessages);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    return (
        <Sheet sx={{ height: '100vh', width: '100vw' }}>
            <GroqContext.Provider value={[groq, setGroq, groqObject, setGroqObject]}>
                <Modal
                    open={openAPIFormModal}
                    onClose={() => {}}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <APIForm onClose={() => setOpenAPIFormModal(false)} />
                </Modal>
                <Box sx={{ display: 'flex', height: '100%' }}>
                    <SideBar 
                        minimized={minimized} 
                        setMinimized={setMinimized}
                        selectedConversationId={selectedConversationId}
                        setSelectedConversationId={handleConversationSelect}
                    />
                    <Sheet sx={{
                        maxWidth: '100%',
                        width: '100%', 
                        height: '100vh',
                        padding: '5px 20px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'start', 
                        alignItems: 'center', 
                        flexGrow: 1 
                    }} color='neutral' variant='soft'>
                        <Header />
                        <ChatApp 
                            message={message} 
                            setMessage={setMessage} 
                            sendMessage={handleMessageSend}
                            messages={messages} 
                            selectedConversationId={selectedConversationId} 
                        />
                        <Footer 
                            setMessage={setMessage} 
                            sendMessage={handleMessageSend} 
                            message={message} 
                            isSending={isSending} 
                            setIsSending={setIsSending} 
                        />
                    </Sheet>
                </Box>
            </GroqContext.Provider>
        </Sheet>
    );
};

function App() {
    return (
        <GoogleOAuthProvider clientId="361703483682-09pguirkr8luq7rjgnhp5rtgn28rpk7s.apps.googleusercontent.com">
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <ChatComponent />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;

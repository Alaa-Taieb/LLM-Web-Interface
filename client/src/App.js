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
    const [groq, setGroq] = useState(null);
    const [openAPIFormModal, setOpenAPIFormModal] = useState(false);
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
    } = HandleMessages(groq, selectedConversationId);

    useEffect(() => {
        const checkForValidKey = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setOpenAPIFormModal(true);
                    return;
                }

                // First, get all keys
                const response = await fetch('http://localhost:5000/api/keys', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const keys = await response.json();
                    if (keys && keys.length > 0) {
                        // Get the actual key value for the first key
                        const keyResponse = await fetch(`http://localhost:5000/api/keys/${keys[0]._id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (keyResponse.ok) {
                            const { key } = await keyResponse.json();
                            try {
                                const groqInstance = new Groq({ 
                                    apiKey: key, 
                                    dangerouslyAllowBrowser: true 
                                });
                                // Test the instance
                                await groqInstance.chat.completions.create({
                                    messages: [{ role: "user", content: "test" }],
                                    model: "llama3-70b-8192",
                                });
                                setGroq(groqInstance);
                                setOpenAPIFormModal(false);
                            } catch (groqError) {
                                console.error('Invalid Groq API key:', groqError);
                                setOpenAPIFormModal(true);
                            }
                        } else {
                            console.error('Failed to fetch API key value');
                            setOpenAPIFormModal(true);
                        }
                    } else {
                        console.log('No valid API keys found');
                        setOpenAPIFormModal(true);
                    }
                } else {
                    console.error('Failed to fetch API keys');
                    setOpenAPIFormModal(true);
                }
            } catch (error) {
                console.error('Error checking for API keys:', error);
                setOpenAPIFormModal(true);
            }
        };

        checkForValidKey();
    }, []);

    const handleMessageSend = async (messageContent) => {
        if (!messageContent.trim()) return;
        await sendMessage(messageContent);
    };

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
                {openAPIFormModal && (
                    <Modal
                        open={openAPIFormModal}
                        onClose={() => {}}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <APIForm onClose={() => setOpenAPIFormModal(false)} />
                    </Modal>
                )}
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

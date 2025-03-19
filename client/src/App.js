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
import Auth from './pages/auth/Auth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// import 'dotenv/config';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/auth" />;
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
                            if (!key) {
                                throw new Error('No API key found');
                            }

                            const groqInstance = new Groq({ 
                                apiKey: key, 
                                dangerouslyAllowBrowser: true 
                            });

                            // Store the API key in the config
                            groqInstance.config = { apiKey: key };
                            
                            // Test the instance
                            await groqInstance.chat.completions.create({
                                messages: [{ role: "user", content: "test" }],
                                model: "llama3-70b-8192",
                            });

                            console.log('Groq instance initialized successfully');
                            setGroq(groqInstance);
                            setOpenAPIFormModal(false);
                        } else {
                            throw new Error('Failed to fetch API key value');
                        }
                    } else {
                        throw new Error('No valid API keys found');
                    }
                } else {
                    throw new Error('Failed to fetch API keys');
                }
            } catch (error) {
                console.error('Error initializing Groq:', error);
                setOpenAPIFormModal(true);
            }
        };

        checkForValidKey();
    }, []);

    const handleMessageSend = async (messageContent) => {
        if (!messageContent.trim()) return;
        
        console.log('Sending message:', {
            content: messageContent,
            conversationId: selectedConversationId,
            hasGroq: !!groq,
            hasApiKey: !!(groq?.config?.apiKey || groq?.apiKey)
        });
        
        try {
            // If no conversation is selected, fetch the most recent conversation
            if (!selectedConversationId) {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/groq/conversations', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const conversations = await response.json();
                // Get the most recent conversation (should be the one just created by the backend)
                const mostRecent = conversations[0];
                if (mostRecent) {
                    setSelectedConversationId(mostRecent._id);
                }
            }

            await sendMessage(messageContent);

            // Trigger a conversation list refresh in the sidebar
            const sidebarRefreshEvent = new CustomEvent('conversationsUpdated');
            window.dispatchEvent(sidebarRefreshEvent);
        } catch (error) {
            console.error('Error handling message send:', error);
        }
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
                        <Header selectedConversationId={selectedConversationId} />
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
                    <Route path="/auth" element={<Auth />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <ChatComponent />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/auth" />} />
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;

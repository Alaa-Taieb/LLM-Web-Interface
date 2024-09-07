import './App.css';
import ChatApp from './components/ChatApp/ChatApp';
import GroqContext from './components/GroqContext';
import { useEffect, useState } from 'react';
import APIForm from './components/APIForm/APIForm';
import { useColorScheme } from '@mui/joy/styles';
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

  // Initialize and manage the 'groq' state object, which contains the API key and other relevant information
  const [groq , setGroq] = useState({ apiKey: "" , dangerouslyAllowBrowser: true})
  
  // Fetch the Groq object from the provided API key using the useEffect hook
  const [groqObject , setGroqObject] = useState();

  return (
    <div className="App">
      <GroqContext.Provider value={[groq , setGroq , groqObject , setGroqObject]}>
        { groq.apiKey == "" ? <APIForm/> : <ChatApp /> }
      </GroqContext.Provider>
    </div>
  );
}

export default App;

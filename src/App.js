import logo from './logo.svg';
import './App.css';
import ChatApp from './components/ChatApp/ChatApp';
import GroqContext from './components/GroqContext';
import { useContext, useState } from 'react';
import APIForm from './components/APIForm/APIForm';

function App() {
  const [groq , setGroq] = useState({ apiKey: "" , dangerouslyAllowBrowser: true})
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

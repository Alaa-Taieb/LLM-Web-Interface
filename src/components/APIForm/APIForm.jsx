import { useContext, useState } from 'react';
import GroqContext from '../GroqContext';
import styles from './APIForm.module.css';
import Groq from 'groq-sdk';

/**
 * Component for the API key input form.
 * 
 * This component allows the user to input their API key, which is then stored in the Groq context.
 * The form dynamically enables the submit button when an API key is entered and disables it when
 * the input is empty.
 * 
 * @returns {JSX.Element} The rendered APIForm component.
 */
const APIForm = () => {
    // State for managing the API key input by the user
    const [apiKey , setApiKey] = useState("");

    // Access and destructure Groq-related state and updater functions from the GroqContext
    const [groq , setGroq , , setGroqObject] = useContext(GroqContext);

    // Effect to initialize the Groq object when the groq state changes
    useState(()=> {
        setGroqObject(new Groq(groq));
    } , [groq])

    /**
     * Handles form submission to update the Groq context with the provided API key.
     * 
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setGroq({...groq, apiKey: apiKey});
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <h2>API KEY REQUIRED</h2>
                <img src="API_Screenshot.png" alt="" width={"500px"} />
                <div>
                    <label htmlFor='api_input'>Enter Your API Key: </label>
                    <input 
                        type="text" 
                        id='api_input' 
                        placeholder='API KEY' 
                        onChange={e => setApiKey(e.target.value)}
                    />
                </div>
                <button 
                    className={apiKey === "" ? styles.disabled_button : styles.active_button} 
                    disabled={apiKey === ""} 
                    type='submit'
                >
                    Save
                </button>
            </form>
        </div>
    )
}


export default APIForm;
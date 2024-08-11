import { useContext, useState } from 'react';
import GroqContext from '../GroqContext';
import styles from './APIForm.module.css';
import Groq from 'groq-sdk';


const APIForm = () => {

    const [apiKey , setApiKey] = useState("");
    const [groq , setGroq , groqObject , setGroqObject] = useContext(GroqContext);


    useState(()=> {
        setGroqObject(new Groq(groq));
    } , [groq])

    const handleSubmit = (e) => {
        e.preventDefault();
        setGroq({...groq, apiKey: apiKey});
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <h2>API KEY REQUIRED</h2>
                <img src="API_Screenshot.png" alt="" width={"500px"}/>
                <div>
                    <label htmlFor='api_input'>Enter Your API Key: </label>
                    <input type="text" id='api_input' placeholder='API KEY' onChange={e => setApiKey(e.target.value)}/>
                </div>
                <button className={apiKey == "" ? styles.disabled_button : styles.active_button} disabled={apiKey == ""} type='submit'>Save</button>
            </form>
        </div>
    )
}


export default APIForm;
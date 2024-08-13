import { useState , useEffect } from 'react';

/**
 * Custom hook to manage chat messages and interaction with the Groq API.
 * 
 * This hook handles sending user messages to the Groq API and updating the message history
 * with the responses. It maintains the list of messages and tracks the previous operation
 * to determine when to fetch a response from the API.
 * 
 * @param {Object} groq - The Groq API instance used to send and receive chat messages.
 * @returns {Object} An object containing the list of messages and the sendMessage function.
 */
export default (groq) => {
    // State to store the list of chat messages
    const [messages , setMessages] = useState([]);

    // State to track the previous operation, used to determine when to fetch a response
    const [previousOp , setPreviousOp] = useState("");

    // System prompt to be prepended to every message sent to the API
    const system_prompt = "[always state the language inside the markdown when including code if code exists]";

    /**
     * Effect to trigger the getResponse function whenever the messages array changes.
     */
    useEffect(() => {
        getResponse();
    } , [messages])

    /**
     * Fetches a response from the Groq API if the previous operation was a "send".
     * 
     * This function sends the user's messages to the API, including the system prompt,
     * and updates the message history with the received response.
     */
    const getResponse = async() => {
        if (previousOp == "send"){
            console.log({
                messages: messages.map(item => {return {role: 'user', content: `${system_prompt}${item.content}`}}),
                model: "llama3-70b-8192"
            });
            
            try {
                const response = await groq.chat.completions.create({
                    messages: messages.map(item => {return {role: 'user', content: `${system_prompt}${item.content}`}}),
                    model: "llama3-70b-8192"
                })

                const receivedMessage = response.choices[0].message;

                // Clear the previous operation and add the received message to the message list
                setPreviousOp("");
                setMessages([...messages, {...receivedMessage , number: messages.length}]);
            }catch(err){
                console.log(err);
            }
        }
    }

    /**
     * Adds a new user message to the message list and triggers the API call.
     * 
     * @param {string} message - The content of the user's message.
     */
    const sendMessage = async (message) => {
        const message_object = 
        {
            number: messages.length,
            role: 'user',
            content: message
        };

        setPreviousOp("send")
        setMessages([...messages , message_object]);

        
    }

    // TODO: Implement function to modify an existing message

    // TODO: Implement function to delete a message
    return {messages , sendMessage}
}
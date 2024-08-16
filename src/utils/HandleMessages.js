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
    /**
     * System prompt that provides context or instructions to the model.
     * This prompt is included as a system message in the conversation.
     * 
     * @type {string}
     */
    const systemPrompt = "always state the language inside the markdown when including code if code exists";

    /**
     * Initial system message object that includes the system prompt.
     * This message is prepended to the list of messages.
     * 
     * @type {Object}
     * @property {string} role - The role of the message sender (always "system").
     * @property {string} content - The content of the system message.
     */
    const systemMessageObject = {role: "system", content: systemPrompt};

    /**
     * State to store the list of chat messages, initialized with the system message.
     * 
     * @type {Array<Object>}
     */
    const [messages , setMessages] = useState([systemMessageObject]);

    /**
     * State to track the previous operation, used to determine when to fetch a response.
     * 
     * @type {string}
     */
    const [previousOp , setPreviousOp] = useState("");

    /**
     * Effect to trigger the getResponse function whenever the messages array changes.
     */
    useEffect(() => {
        getResponse();
    } , [messages])

    /**
     * Fetches a response from the Groq API if the previous operation was a "send".
     * 
     * This function sends the user's messages to the API and updates the message history
     * with the received response. The system prompt is included in each user message sent to the API.
     */
    const getResponse = async() => {
        if (previousOp == "send"){
            try {
                const response = await groq.chat.completions.create({
                    messages: messages.map(item => {return {role: 'user', content: item.content}}),
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

        // Set operation to "send" and update the message list with the new message
        setPreviousOp("send")
        setMessages([...messages , message_object]);

        
    }

    // TODO: Implement function to modify an existing message

    // TODO: Implement function to delete a message
    return {messages , sendMessage}
}
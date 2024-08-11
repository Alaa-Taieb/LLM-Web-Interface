
import { useState , useEffect } from 'react';


export default (groq) => {
    const [messages , setMessages] = useState([]);
    const [previousOp , setPreviousOp] = useState("");
    const system_prompt = "[always state the language inside the markdown when including code if code exists]";

    useEffect(() => {
        getResponse();
    } , [messages])

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
                setPreviousOp("");
                setMessages([...messages, {...receivedMessage , number: messages.length}]);
            }catch(err){
                console.log(err);
            }
        }
    }

    // Add user message
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

    // TODO: Modify Message

    // TODO: Delete Message

    return {messages , sendMessage}
}
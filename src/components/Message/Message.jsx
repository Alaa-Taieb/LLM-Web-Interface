import React , {useEffect} from 'react';
import styles from './Message.module.css';
import showdown from 'showdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-twilight.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-ruby';

const Message = ({message}) => {

    const converter = new showdown.Converter();

    useEffect(() => {
        Prism.highlightAll();
    }, []);

    const convert = (mo) => {
        if (mo.role == 'user'){
            return mo.content;
        }
        let m = mo.content;
        // console.log(m);
        m = converter.makeHtml(m);
        // m = m.split("<");
        return m;
    }

    return (
        <div  className={ message.role == "user" ? styles.mUser : styles.mAdmin} >
            <div dangerouslySetInnerHTML={{__html: convert(message)}}></div>
        </div>
    );
}

export default Message;

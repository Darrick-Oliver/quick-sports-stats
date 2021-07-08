import './comments.css';
import React from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MAXLEN = 200;

const getComments = () => {

}

const handleSubmit = () => {
    const text = document.getElementById('comment-text').value;

    console.log(text.length);

    if (text.length > MAXLEN) {
        document.getElementById('comment-err').innerHTML = `Number of characters exceeds maximum: (${text.length}/${MAXLEN})` ;
        return;
    } else {
        document.getElementById('comment-err').innerHTML = '';
    }
    
    // Later will submit comment (verify user is logged in)
    console.log(text);
}

const displayComments = () => {
    return (
        <div className='comment-container'>
            <h1>Comments</h1>
            <textarea id='comment-text' className='comment-textarea'/><br />
            <div id='comment-err' className='comment-error-message'></div>
            <Button id='submit-comment' variant='outline-success' onClick={() => handleSubmit()}>Submit</Button>
        </div>
    );
}

export { getComments, displayComments };
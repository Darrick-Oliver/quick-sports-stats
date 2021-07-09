import './comments.css';
import React from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MAXLEN = 200;

const getComments = (comments) => {
    console.log(comments);

    return (
        <div className='all-comments-container'>
            test
        </div>
    );
}

const handleSubmit = async (gameId) => {
    const content = document.getElementById('comment-text').value;

    // Error checking
    if (content.length > MAXLEN) {
        document.getElementById('comment-err').innerHTML = `Number of characters exceeds maximum: (${content.length}/${MAXLEN})` ;
        return;
    }

    // Submit comment
    const result = await fetch('/api/post-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            gameId
        })
    }).then((res) => res.json());

    // Check for errors
    if (result.status === 'error') {
        document.getElementById('comment-err').innerHTML = `${result.error}` ;
        return;
    } else {
        document.getElementById('comment-err').innerHTML = '';
    }
}

const displayComments = (gameId, comments) => {
    return (
        <div className='comment-container'>
            <h1>Comments</h1>
            <textarea id='comment-text' className='comment-textarea'/><br />
            <div id='comment-err' className='comment-error-message'></div>
            <Button id='submit-comment' variant='outline-success' onClick={() => handleSubmit(gameId)}>Submit</Button>
        </div>
    );
}

export { displayComments };
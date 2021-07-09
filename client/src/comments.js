import './comments.css';
import React from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MAXLEN = 500;

const editComment = (id) => {
    // Show a textarea to edit comment
    // Include a button to send edits to server
}

const deleteComment = (id) => {
    // Remove comment from db
}

const replyToComment = (id) => {
    // Remove comment from db
}

const displayComments = (comments) => {
    return (
        <div className='comments-container'>
            {comments.map(comment => {
                return (
                    <div className='comment' key={comment._id}>
                        <p className='username'>{comment.username}</p>
                        <p className='date'>
                            {new Date(comment.date).toLocaleDateString() + ' '}
                            {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                        </p>
                        <p id={comment._id} className='content'>{comment.content}</p>
                        <a className='comment-buttons' onClick={() => {editComment(comment._id)}}>edit</a>
                        <a className='comment-buttons' onClick={() => {deleteComment(comment._id)}}>delete</a>
                        <a className='comment-buttons' onClick={() => {replyToComment(comment._id)}}>reply</a>
                    </div>
                );
            })}
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

    // Clear textarea
    document.getElementById('comment-text').value = '';
}

const submitComments = (gameId) => {
    return (
        <div className='submit-comment-container'>
            <h1>Comments</h1>
            <textarea id='comment-text' className='comment-textarea'/><br />
            <div id='comment-err' className='comment-error-message'></div>
            <Button id='submit-comment' variant='outline-success' onClick={() => handleSubmit(gameId)}>Submit</Button>
        </div>
    );
}

export { submitComments, displayComments };
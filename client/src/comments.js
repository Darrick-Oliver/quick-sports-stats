import './comments.css';
import React, { useState, useEffect } from 'react';
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
    // Sort comments by newest
    comments = comments.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    })


    return (
        <div className='comments-container'>
            {comments.map(comment => {
                return (
                    <div className='comment' key={comment._id}>
                        <p className='tagline'>
                            <span className='username'>{comment.username}</span>
                            {' • '}
                            <span className='date'>
                                {new Date(comment.date).toLocaleDateString() + ' '}
                                {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                            </span>
                        </p>
                        <p id={comment._id} className='content'>{comment.content}</p>
                        <button className='comment-buttons' onClick={() => {editComment(comment._id)}}>edit</button>
                        <button className='comment-buttons' onClick={() => {deleteComment(comment._id)}}>delete</button>
                        <button className='comment-buttons' onClick={() => {replyToComment(comment._id)}}>reply</button>
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
    const result = await fetch('/api/comments/post', {
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

    // Refresh comments
    return result.data;
}

const Comments = (req) => {
    const [ comments, setComments ] = useState(null);

    // Fetch comments
    useEffect(() => {
        fetch(`/api/comments/get/${req.gameData.gameId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setComments(data.comments);
                }
            })
            .catch(err => {
                console.error("Error fetching data:", err);
            });
    }, [req]);

    useEffect(() => {

    }, [comments]);

    return (
        <div>
            <div className='submit-comment-container'>
                <h1>Comments</h1>
                <textarea id='comment-text' className='comment-textarea'/><br />
                <div id='comment-err' className='comment-error-message'></div>
                <Button id='submit-comment' variant='outline-success' onClick={() => handleSubmit(req.gameData.gameId).then((newComment) => {
                    if (newComment && comments) {
                        comments.push(newComment);
                        setComments([...comments]);
                    } else if (newComment) {
                        setComments([newComment]);
                    }
                })}>Submit</Button>
            </div>
            {comments && displayComments(comments)}
        </div>
    );
}

export default Comments;
import './comments.css';
import React, { useState, useEffect } from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Filter = require('./bad-words-hacked'), filter = new Filter();

const handleSubmit = async (type, gameId) => {
    const content = document.getElementById('comment-text').value;
    const parentId = 'root';

    // Submit comment
    const result = await fetch('/api/comments/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            type,
            gameId,
            parentId
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
    const [ reply, setReply ] = useState(null);

    const deleteComment = async (id) => {
        // Remove comment from db
        const result = await fetch(`/api/comments/${id}/delete`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json());
    
        return result.status;
    }

    const replyToComment = async (type, gameId, parentId, i) => {
        // Add reply to db
        const content = document.getElementById(`reply-${parentId}-text`).value;

        const result = await fetch('/api/comments/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                type,
                gameId,
                parentId
            })
        }).then((res) => res.json());

        // Check for errors
        if (result.status === 'error') {
            document.getElementById(`reply-${parentId}-err`).innerHTML = `${result.error}` ;
            return;
        } else {
            document.getElementById(`reply-${parentId}-err`).innerHTML = '';
        }

        loadReply(i);
        
        return result.data;
    }

    const loadReply = async (i) => {
        if (reply) {
            reply[i] = !reply[i];
            setReply([...reply]);
        }
    }

    // Fetch comments
    useEffect(() => {
        fetch(`/api/comments/get/${req.type}/${req.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setComments(data.comments.sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    }));
                }

                if (data.comments)
                    setReply(new Array(data.comments.length).fill(false));
            })
            .catch(err => {
                console.error("Error fetching data:", err);
            });
    }, [req]);
    
    return (
        <div>
            <div className='submit-comment-container'>
                <h1>Comments</h1>
                <br />
                <textarea id='comment-text' className='comment-textarea'/><br />
                <div id='comment-err' className='comment-error-message'></div>
                <Button id='submit-comment' variant='outline-success' onClick={() => handleSubmit(req.type, req.id).then((newComment) => {
                    if (newComment && comments) {
                        // Add comment to comments and sort
                        comments.push(newComment);
                        setComments(comments.sort((a, b) => {
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                        }));
                        setComments([...comments]);
                    } else if (newComment) {
                        // If single comment added, only add that one
                        setComments([newComment]);
                    }
                })}>Submit</Button>
            </div>
            {comments && 
            <div className='comments-container'>
                {comments.map(comment => {
                    return (
                        // Make sure comment exists
                        comment && reply &&
                        <div className='comment' key={comment._id} id={comment._id}>
                            <p className='tagline'>
                                <span className='username'>{comment.username}</span>
                                {' • '}
                                <span className='date'>
                                    {new Date(comment.date).toLocaleDateString() + ' '}
                                    {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                </span>
                            </p>
                            <div id={comment._id}>
                                <p id={`${comment._id}-content`}className='content'>
                                    {comment.parentId !== 'root' && <a className='user-link' href='./my-profile'>@{comment.parentUser}</a>}
                                    {comment.parentId !== 'root' && ' '}
                                    {filter.cleanHacked(comment.content)}
                                </p>
                            </div>

                            <button className='comment-buttons' onClick={() => {deleteComment(comment._id).then((status) => {
                                // Delete comment from comments if it was deleted from server
                                if (status === 'ok') {
                                    delete reply[comments.indexOf(comment)];
                                    delete comments[comments.indexOf(comment)];
                                    // Update components
                                    setComments([...comments]);
                                }
                            })}}>delete</button>

                            <button className='comment-buttons' id={`reply-${comment._id}`} onClick={() => loadReply(comments.indexOf(comment))}>{reply[comments.indexOf(comment)] ? 'cancel' : 'reply'}</button>

                            {reply[comments.indexOf(comment)] &&
                                <div className='reply'>
                                    <textarea id={`reply-${comment._id}-text`} className='comment-textarea reply-textarea'/><br />
                                    <div id={`reply-${comment._id}-err`} className='comment-error-message'></div>
                                    <Button id='submit-reply' variant='outline-success' onClick={() => replyToComment(req.type, req.id, comment._id, comments.indexOf(comment)).then((newReply) => {
                                        if (newReply && comments) {
                                            // Add comment to comments and sort
                                            comments.push(newReply);
                                            setComments(comments.sort((a, b) => {
                                                return new Date(b.date).getTime() - new Date(a.date).getTime();
                                            }));
                                            setComments([...comments]);
                                        }
                                    })}>Reply</Button>
                                </div>
                            }
                        </div>
                    );
                })}
            </div>}
        </div>
    );
}

export default Comments;
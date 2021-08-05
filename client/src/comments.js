import './comments.css';
import React, { useState, useEffect } from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Filter = require('./bad-words-hacked'), filter = new Filter();


const Comments = (req) => {
    const [ comments, setComments ] = useState(null);
    const [ replyBoxes, setReplyBoxes ] = useState(null);

    // Handles comment submission
    const submitComment = async (type, gameId) => {
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

    // Sends a delete request to the server
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

    // Sends a reply to the server
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

    // Loads a reply box to the requested comment
    const loadReply = async (i) => {
        if (replyBoxes) {
            replyBoxes[i] = !replyBoxes[i];
            setReplyBoxes([...replyBoxes]);
        }
    }

    // Recursively loads replies
    const showReplies = (comments, comment, indent) => {
        const replies = comments.filter((e) => { if (e) return e.parentId === comment._id; else return 0;});
    
        // Recursive end condition
        if (replies.length === 0)
            return;
    
        return (
            replies.map(reply => {
                return (
                    <div key={reply._id} className='comment-and-replies'>
                        <div className='comment' style={{marginLeft: indent + 20}} id={reply._id}>
                            <p className='tagline'>
                                <a className='username' href={`./user/${reply.username}`}>{reply.username}</a>
                                {' • '}
                                <span className='date'>
                                    {new Date(reply.date).toLocaleDateString() + ' '}
                                    {new Date(reply.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                </span>
                            </p>
                            <div id={reply._id}>
                                <p id={`${reply._id}-content`}className='content'>
                                    {reply.parentId !== 'root' && <a className='user-link' href={`./user/${reply.parentUser}`}>@{reply.parentUser}</a>}
                                    {reply.parentId !== 'root' && ' '}
                                    {filter.cleanHacked(reply.content)}
                                </p>
                            </div>
        
                            <button className='comment-buttons' onClick={() => {deleteComment(reply._id).then((status) => {
                                // Delete comment from comments if it was deleted from server
                                if (status === 'ok') {
                                    delete replyBoxes[comments.indexOf(reply)];
                                    delete comments[comments.indexOf(reply)];
                                    // Update components
                                    setComments([...comments]);
                                }
                            })}}>delete</button>
        
                            <button className='comment-buttons' id={`reply-${reply._id}`} onClick={() => loadReply(comments.indexOf(reply))}>{replyBoxes[comments.indexOf(reply)] ? 'cancel' : 'reply'}</button>
        
                            {replyBoxes[comments.indexOf(reply)] &&
                                <div className='reply-box'>
                                    <textarea id={`reply-${reply._id}-text`} autoFocus className='comment-textarea reply-textarea'/><br />
                                    <div id={`reply-${reply._id}-err`} className='comment-error-message'></div>
                                    <Button id='submit-reply' variant='outline-success' onClick={() => replyToComment(req.type, req.id, reply._id, comments.indexOf(reply)).then((newReply) => {
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
                        {showReplies(comments, reply, indent + 20)}
                    </div>
                );
            })
        );
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
                    setReplyBoxes(new Array(data.comments.length).fill(false));
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
                <Button id='submit-comment' variant='outline-success' onClick={() => submitComment(req.type, req.id).then((newComment) => {
                    if (newComment && comments) {
                        // Add comment to comments and sort
                        comments.push(newComment);
                        setComments(comments.sort((a, b) => {
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                        }));
                        setComments([...comments]);

                        // Close new reply
                        setReplyBoxes([false, ...replyBoxes]);
                    } else if (newComment) {
                        // If single comment added, only add that one
                        setComments([newComment]);

                        // Set replies
                        setReplyBoxes([false]);
                    }
                })}>Submit</Button>
            </div>
            {comments && 
            <div className='comments-container'>
                {comments.map(comment => {
                    return (
                        // Make sure comment exists
                        comment && comment.parentId === 'root' && replyBoxes &&
                        <div className='comment-and-replies' key={comment._id}>
                            <div className='comment' id={comment._id}>
                                <p className='tagline'>
                                    <a className='username' href={`./user/${comment.username}`}>{comment.username}</a>
                                    {' • '}
                                    <span className='date'>
                                        {new Date(comment.date).toLocaleDateString() + ' '}
                                        {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                    </span>
                                </p>
                                <div>
                                    <p id={`${comment._id}-content`}className='content'>
                                        {comment.parentId !== 'root' && <a className='user-link' href={`./user/${comment.parentUser}`}>@{comment.parentUser}</a>}
                                        {comment.parentId !== 'root' && ' '}
                                        {filter.cleanHacked(comment.content)}
                                    </p>
                                </div>

                                <button className='comment-buttons' onClick={() => {deleteComment(comment._id).then((status) => {
                                    // Delete comment from comments if it was deleted from server
                                    if (status === 'ok') {
                                        delete replyBoxes[comments.indexOf(comment)];
                                        delete comments[comments.indexOf(comment)];
                                        // Update components
                                        setComments([...comments]);
                                    }
                                })}}>delete</button>

                                <button className='comment-buttons' id={`reply-${comment._id}`} onClick={() => loadReply(comments.indexOf(comment))}>{replyBoxes[comments.indexOf(comment)] ? 'cancel' : 'reply'}</button>

                                {replyBoxes[comments.indexOf(comment)] &&
                                    <div className='reply-box'>
                                        <textarea id={`reply-${comment._id}-text`} autoFocus className='comment-textarea reply-textarea'/><br />
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

                            {showReplies(comments, comment, 0)}
                        </div>
                    );
                })}
            </div>}
        </div>
    );
}

export default Comments;
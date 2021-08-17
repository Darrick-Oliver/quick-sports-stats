import './comments.css';
import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'react-bootstrap';
import './css/bootstrap.min.css';
import { UserContext } from './App.js';
import { Link } from "react-router-dom";

const Filter = require('bad-words'), filter = new Filter();

const Comments = (req) => {
    const [comments, setComments] = useState(null);
    const [replyBoxes, setReplyBoxes] = useState(null);
    const [editBoxes, setEditBoxes] = useState(null);
    const [delConfirm, setDelConfirm] = useState(null);
    const myUser = JSON.parse(useContext(UserContext).user);

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
            document.getElementById('comment-err').innerHTML = `${result.error}`;
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

        // Check for errors
        if (result.status === 'error') {
            document.getElementById(`comment-${id}-err`).innerHTML = `${result.error}`;
        } else {
            document.getElementById(`comment-${id}-err`).innerHTML = '';
        }

        return result;
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
            document.getElementById(`reply-${parentId}-err`).innerHTML = `${result.error}`;
            return;
        } else {
            document.getElementById(`reply-${parentId}-err`).innerHTML = '';
        }

        loadReply(i);
        return result.data;
    }

    // Sends edits to the server
    const editComment = async (_id, i, prevContent) => {
        const content = document.getElementById(`edit-${_id}-text`).value;

        // Check if any edits were made
        if (content === prevContent) {
            // If not, just close edit box
            editBoxes[i] = false;
            setEditBoxes([...editBoxes]);
            return;
        }

        const result = await fetch(`/api/comments/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                _id
            })
        }).then((res) => res.json());
        
        if (result.status === 'ok') {
            // Close edit box on success
            editBoxes[i] = false;
            setEditBoxes([...editBoxes]);
        } else if (result.status === 'error') {
            document.getElementById(`edit-${_id}-err`).innerHTML = `${result.error}`;
        }
        
        return result;
    }

    // Loads a reply box to the requested comment
    const loadReply = (i) => {
        if (replyBoxes) {
            replyBoxes[i] = !replyBoxes[i];
            setReplyBoxes([...replyBoxes]);
        }
    }

    // Loads a reply box to the requested comment
    const loadEdit = (i) => {
        if (editBoxes) {
            editBoxes[i] = !editBoxes[i];
            setEditBoxes([...editBoxes]);
        }
    }

    // Recursively loads replies
    const showReplies = (comments, comment, indent) => {
        const replies = comments.filter((e) => { if (e) return e.parentId === comment._id; else return 0; });

        // Sort by oldest in replies
        replies.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // Recursive end condition
        if (replies.length === 0)
            return;

        return (
            replies.map(reply => {
                return (
                    <div key={reply._id} className='comment-and-replies'>
                        {generateComment(reply, indent + 20)}
                        {showReplies(comments, reply, indent + 20)}
                    </div>
                );
            })
        );
    }

    // Generates comment formatting
    const generateComment = (comment, indent) => {
        return (
            <div className='comment' style={{ marginLeft: indent }} id={comment._id}>
                <p className='tagline'>
                    <Link className='username' to={`./user/${comment.username}`}>{comment.username}</Link>
                    {' • '}
                    <span className='date'>
                        {new Date(comment.date).toLocaleDateString() + ' '}
                        {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                    </span>
                    {comment.edited && comment.editDate && 
                        <span className='edit-date'>
                            {'(last edited: '}
                            {new Date(comment.editDate).toLocaleDateString() + ' '}
                            {new Date(comment.editDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                            {')'}
                        </span>
                    }
                </p>
                <div id={comment._id}>
                    <span id={`${comment._id}-content`} className='content'>
                        {comment.parentId !== 'root' && comment.parentUser !== '[deleted]' && <Link className='user-link' to={`./user/${comment.parentUser}`}>@{comment.parentUser}</Link>}
                        {comment.parentId !== 'root' && comment.parentUser !== '[deleted]' && ' '}
                        {editBoxes[comments.indexOf(comment)] ? 
                            <div className='reply-box edit-box'>
                                <textarea id={`edit-${comment._id}-text`} autoFocus className='comment-textarea reply-textarea' defaultValue={comment.content} /><br />
                                <div id={`edit-${comment._id}-err`} className='comment-error-message'></div>
                                <Button id='submit-edit' variant='outline-success' onClick={() => editComment(comment._id, comments.indexOf(comment), comment.content).then((result) => {
                                    // Update edited comment
                                    if (result && result.comment && result.comment.length === 1) {
                                        comments[comments.indexOf(comment)] = result.comment[0];

                                        // Update components
                                        setComments([...comments]);
                                    }
                                })}>Submit</Button>
                            </div>
                        : filter.clean(comment.content)}
                    </span>
                </div>

                {myUser && comment.username === myUser.username && <button className='comment-buttons' id={`edit-${comment._id}`} onClick={() => loadEdit(comments.indexOf(comment))}>{editBoxes[comments.indexOf(comment)] ? 'cancel' : 'edit'}</button>}

                {myUser && (comment.username === myUser.username || myUser.admin) && !delConfirm[comments.indexOf(comment)] && <button className='comment-buttons' onClick={() => {
                    if (delConfirm) {
                        delConfirm[comments.indexOf(comment)] = true;
                        setDelConfirm([...delConfirm]);
                    }
                }}>delete</button>}

                {delConfirm[comments.indexOf(comment)] &&
                    <span className='delete-confirm'>
                        are you sure?
                        <button className='delete-buttons' onClick={() => {
                            deleteComment(comment._id).then((result) => {
                                if (result.status === 'ok' && result.data === 'deleted') {
                                    // Delete comment from comments if it was deleted from server
                                    delete delConfirm[comments.indexOf(comment)];
                                    delete replyBoxes[comments.indexOf(comment)];
                                    delete editBoxes[comments.indexOf(comment)];
                                    delete comments[comments.indexOf(comment)];
        
                                    // Update components
                                    setComments([...comments]);
                                }
                                else if (result.status === 'ok' && result.data === 'modified') {
                                    // Modify comment to [deleted] if it was modified on server
                                    comments[comments.indexOf(comment)].content = '[Deleted by user]';
                                    comments[comments.indexOf(comment)].username = '[deleted]';
                                    comments[comments.indexOf(comment)].parentUser = '[deleted]';

                                    // Close everything
                                    delConfirm[comments.indexOf(comment)] = false;
                                    replyBoxes[comments.indexOf(comment)] = false;
                                    editBoxes[comments.indexOf(comment)] = false;
                                    setDelConfirm([...delConfirm]);
                                    setReplyBoxes([...replyBoxes]);
                                    setEditBoxes([...editBoxes]);
        
                                    // Change parentUser of replies (there's probably a better way to do this)
                                    const replies = comments.filter((e) => { if (e) return e.parentId === comment._id; else return 0; });
                                    if (replies.length !== 0) {
                                        replies.map((reply) => {
                                            comments[comments.indexOf(reply)].parentUser = '[deleted]';
                                            return 0;
                                        });
                                    }
        
                                    // Update components
                                    setComments([...comments]);
                                }
                            })
                        }}>yes</button>
                        /
                        <button className='delete-buttons' onClick={() => {
                            if (delConfirm) {
                                delConfirm[comments.indexOf(comment)] = false;
                                setDelConfirm([...delConfirm]);
                            }
                        }}>no</button>
                    </span>
                }

                <button className='comment-buttons' id={`reply-${comment._id}`} onClick={() => loadReply(comments.indexOf(comment))}>{replyBoxes[comments.indexOf(comment)] ? 'cancel' : 'reply'}</button>

                {replyBoxes[comments.indexOf(comment)] &&
                    <div className='reply-box'>
                        <textarea id={`reply-${comment._id}-text`} autoFocus className='comment-textarea reply-textarea' /><br />
                        <div id={`reply-${comment._id}-err`} className='comment-error-message'></div>
                        <Button id='submit-reply' variant='outline-success' onClick={() => replyToComment(req.type, req.id, comment._id, comments.indexOf(comment)).then((newReply) => {
                            if (newReply && comments) {
                                // Add comment to comments and sort
                                comments.push(newReply);
                                setComments(comments.sort((a, b) => {
                                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                                }));
                                setComments([...comments]);

                                // Set reply and edit boxes
                                setDelConfirm([false, ...delConfirm])
                                setReplyBoxes([false, ...replyBoxes]);
                                setEditBoxes([false, ...editBoxes]);
                            }
                        })}>Reply</Button>
                    </div>
                }

                <span id={`comment-${comment._id}-err`} className='comment-error-message'></span>
            </div>
        )
    }

    // Fetch comments from areto db
    useEffect(() => {
        fetch(`/api/comments/get/${req.type}/${req.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setComments(data.comments.sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    }));

                    if (data.comments) {
                        setDelConfirm(new Array(data.comments.length).fill(false));
                        setReplyBoxes(new Array(data.comments.length).fill(false));
                        setEditBoxes(new Array(data.comments.length).fill(false));
                    }
                }
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
                <textarea id='comment-text' className='comment-textarea' /><br />
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
                        setDelConfirm([false, ...delConfirm]);
                        setReplyBoxes([false, ...replyBoxes]);
                        setEditBoxes([false, ...editBoxes]);
                    } else if (newComment) {
                        // If single comment added, only add that one
                        setComments([newComment]);

                        // Set replies
                        setDelConfirm([false]);
                        setReplyBoxes([false]);
                        setEditBoxes([false]);
                    }
                })}>Submit</Button>
            </div>
            {comments &&
                <div className='comments-container'>
                    {comments.map(comment => {
                        return (
                            // Make sure comment exists
                            comment && comment.parentId === 'root' && replyBoxes && editBoxes && 
                            <div className='comment-section' key={comment._id}>
                                {generateComment(comment, 0)}
                                {showReplies(comments, comment, 0)}
                            </div>
                        );
                    })}
                </div>}
        </div>
    );
}

export default Comments;
import './comments.css';
import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'react-bootstrap';
import './css/bootstrap.min.css';
import { UserContext } from './App.js';
import { Link } from "react-router-dom";

const Filter = require('bad-words'), filter = new Filter();

const getImage = (id, type) => {
    return `${process.env.PUBLIC_URL}/assets/images/${type}_logos/${id}.svg`;
}

// Returns time since the given date
const timeSince = (date) => {
    if (typeof date !== 'object') {
      date = new Date(date);
    }
  
    var seconds = Math.floor((new Date() - date) / 1000);
    var intervalType;
  
    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      intervalType = 'year';
    } else {
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) {
        intervalType = 'month';
      } else {
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
          intervalType = 'day';
        } else {
          interval = Math.floor(seconds / 3600);
          if (interval >= 1) {
            intervalType = "hour";
          } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
              intervalType = "minute";
            } else {
              interval = seconds;
              intervalType = "second";
            }
          }
        }
      }
    }
  
    if (interval > 1 || interval === 0) {
      intervalType += 's';
    }
  
    return interval + ' ' + intervalType;
}

const Comments = (req) => {
    const [comments, setComments] = useState(null);
    const [replyBoxes, setReplyBoxes] = useState(null);
    const [editBoxes, setEditBoxes] = useState(null);
    const [delConfirm, setDelConfirm] = useState(null);
    const [closeBoxes, setCloseBoxes] = useState(null);
    const [checkedComments, setCheckedComments] = useState(false);
    const myUser = JSON.parse(useContext(UserContext).user);

    // Handles comment submission
    const submitComment = async (type, gameId) => {
        const content = document.getElementById('comment-text').value;
        const parentId = 0;
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
        if (result.status === 'error' && document.getElementById(`comment-${id}-err`)) {
            document.getElementById(`comment-${id}-err`).innerHTML = `${result.error}`;
        } else if (document.getElementById(`comment-${id}-err`)) {
            document.getElementById(`comment-${id}-err`).innerHTML = '';
        } else if (result.status === 'error' ) {
            console.error(result.error);
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
    const editComment = async (commentId, i, prevContent) => {
        const content = document.getElementById(`edit-${commentId}-text`).value;

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
                commentId
            })
        }).then((res) => res.json());
        
        if (result.status === 'ok') {
            // Close edit box on success
            editBoxes[i] = false;
            setEditBoxes([...editBoxes]);
        } else if (result.status === 'error') {
            document.getElementById(`edit-${commentId}-err`).innerHTML = `${result.error}`;
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
    const showReplies = (comments, commentData, indent) => {
        const replies = comments.filter((e) => { if (e) return e.comment.parentId === commentData.comment.commentId; else return 0; });

        // Sort by oldest in replies
        replies.sort((a, b) => {
            return new Date(a.comment.date).getTime() - new Date(b.comment.date).getTime();
        });

        // Recursive end condition
        if (replies.length === 0)
            return;

        return (
            replies.map(reply => {
                return (
                    <div key={reply.comment.commentId} className='comment-and-replies'>
                        {generateComment(reply, indent + 20)}
                        {!closeBoxes[comments.indexOf(reply)] && showReplies(comments, reply, indent + 20)}
                    </div>
                );
            })
        );
    }

    // 
    const openCloseComment = (i) => {
        if (closeBoxes) {
            closeBoxes[i] = !closeBoxes[i];
            setCloseBoxes([...closeBoxes]);
        }
    }

    // Generates comment formatting
    const generateComment = (commentData, indent) => {
        return (
            <div className='comment' style={{ marginLeft: indent, width: `calc(95% - ${indent}px)` }} id={commentData.comment.commentId}>
                <span className='tagline'>
                    <button className='comment-buttons' onClick={() => {openCloseComment(comments.indexOf(commentData))}}>[ {closeBoxes[comments.indexOf(commentData)] ? '+' : '-'} ]</button>
                    <Link className='username' to={`/user/${commentData.comment.username}`}>{commentData.comment.username}</Link>
                    {req.type === 'mls' && commentData.userInfo.favMLS !== 'none' && <img style={{marginLeft: 5}} src={getImage(commentData.userInfo.favMLS, 'mls')} alt={commentData.userInfo.favMLS} height='25' />}
                    {req.type === 'nba' && commentData.userInfo.favNBA !== 'none' && <img style={{marginLeft: 5}} src={getImage(commentData.userInfo.favNBA, 'nba')} alt={commentData.userInfo.favNBA} height='25' />}
                    {' • '}
                    <span className='date' title={new Date(commentData.comment.date).toString()}>
                        {timeSince(commentData.comment.date) + ' ago'}
                    </span>
                    {commentData.comment.edited && commentData.comment.editDate && 
                        <span className='edit-date' title={new Date(commentData.comment.editDate).toString()}>
                            {`(last edited: ${timeSince(commentData.comment.editDate) + ' ago'})`}
                        </span>
                    }
                </span>

                {!closeBoxes[comments.indexOf(commentData)] && 
                    <div className='comment-body'>
                        <div id={commentData.comment.commentId}>
                            <span id={`${commentData.comment.commentId}-content`} className='content'>
                                {commentData.comment.parentId !== 0 && commentData.comment.parentUser !== '[deleted]' && <Link className='user-link' to={`/user/${commentData.comment.parentUser}`}>@{commentData.comment.parentUser}</Link>}
                                {commentData.comment.parentId !== 0 && commentData.comment.parentUser !== '[deleted]' && ' '}
                                {editBoxes[comments.indexOf(commentData)] ? 
                                    <div className='reply-box edit-box'>
                                        <textarea id={`edit-${commentData.comment.commentId}-text`} autoFocus className='comment-textarea reply-textarea' defaultValue={commentData.comment.content} /><br />
                                        <div id={`edit-${commentData.comment.commentId}-err`} className='comment-error-message'></div>
                                        <Button id='submit-edit' variant='outline-success' onClick={() => editComment(commentData.comment.commentId, comments.indexOf(commentData), commentData.comment.content).then((result) => {
                                            // Update edited comment
                                            if (result && result.comment && result.comment.length === 1) {
                                                const resultFormatted = {
                                                    comment: result.comment[0],
                                                    userInfo: {
                                                        favMLS: myUser.favMLS,
                                                        favNBA: myUser.favNBA,
                                                        username: myUser.username
                                                    }
                                                };
                                                comments[comments.indexOf(commentData)] = resultFormatted;

                                                // Update components
                                                setComments([...comments]);
                                            }
                                        })}>Submit</Button>
                                    </div>
                                : filter.clean(commentData.comment.content)}
                            </span>
                        </div>

                        <Link to={`/comments/d/${commentData.comment.commentId}`}><button className='comment-buttons' id={`permalink-${commentData.comment.commentId}`}>permalink</button></Link>

                        {myUser && commentData.comment.username === myUser.username && <button className='comment-buttons' id={`edit-${commentData.comment.commentId}`} onClick={() => loadEdit(comments.indexOf(commentData))}>{editBoxes[comments.indexOf(commentData)] ? 'cancel' : 'edit'}</button>}

                        {myUser && (commentData.comment.username === myUser.username || myUser.admin) && !delConfirm[comments.indexOf(commentData)] && <button className='comment-buttons' onClick={() => {
                            if (delConfirm) {
                                delConfirm[comments.indexOf(commentData)] = true;
                                setDelConfirm([...delConfirm]);
                            }
                        }}>delete</button>}

                        {delConfirm[comments.indexOf(commentData)] &&
                            <span className='delete-confirm'>
                                are you sure?
                                <button className='delete-buttons' onClick={() => {
                                    deleteComment(commentData.comment.commentId).then((result) => {
                                        if (result.status === 'ok' && result.data === 'deleted') {
                                            // Delete comment from comments if it was deleted from server
                                            delete delConfirm[comments.indexOf(commentData)];
                                            delete replyBoxes[comments.indexOf(commentData)];
                                            delete editBoxes[comments.indexOf(commentData)];
                                            delete closeBoxes[comments.indexOf(commentData)];
                                            delete comments[comments.indexOf(commentData)];
                
                                            // Update components
                                            setComments([...comments]);
                                        }
                                        else if (result.status === 'ok' && result.data === 'modified') {
                                            // Modify comment to [deleted] if it was modified on server
                                            comments[comments.indexOf(commentData)].comment.content = '[Deleted by user]';
                                            comments[comments.indexOf(commentData)].comment.username = '[deleted]';
                                            comments[comments.indexOf(commentData)].comment.parentUser = '[deleted]';
                                            comments[comments.indexOf(commentData)].userInfo.favMLS = 'none';
                                            comments[comments.indexOf(commentData)].comment.favNBA = 'none';
                                            comments[comments.indexOf(commentData)].comment.username = '[deleted]';

                                            // Close everything
                                            delConfirm[comments.indexOf(commentData)] = false;
                                            replyBoxes[comments.indexOf(commentData)] = false;
                                            editBoxes[comments.indexOf(commentData)] = false;
                                            closeBoxes[comments.indexOf(commentData)] = false;
                                            setDelConfirm([...delConfirm]);
                                            setReplyBoxes([...replyBoxes]);
                                            setEditBoxes([...editBoxes]);
                                            setCloseBoxes([...closeBoxes]);
                
                                            // Change parentUser of replies (there's probably a better way to do this)
                                            const replies = comments.filter((e) => { if (e) return e.comment.parentId === commentData.comment.commentId; else return 0; });
                                            if (replies.length !== 0) {
                                                replies.map((reply) => {
                                                    comments[comments.indexOf(reply)].comment.parentUser = '[deleted]';
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
                                        delConfirm[comments.indexOf(commentData)] = false;
                                        setDelConfirm([...delConfirm]);
                                    }
                                }}>no</button>
                            </span>
                        }

                        <button className='comment-buttons' id={`reply-${commentData.comment.commentId}`} onClick={() => loadReply(comments.indexOf(commentData))}>{replyBoxes[comments.indexOf(commentData)] ? 'cancel' : 'reply'}</button>

                        {replyBoxes[comments.indexOf(commentData)] &&
                            <div className='reply-box'>
                                <textarea id={`reply-${commentData.comment.commentId}-text`} autoFocus className='comment-textarea reply-textarea' /><br />
                                <div id={`reply-${commentData.comment.commentId}-err`} className='comment-error-message'></div>
                                <Button id='submit-reply' variant='outline-success' onClick={() => replyToComment(req.type, req.id, commentData.comment.commentId, comments.indexOf(commentData)).then((newReply) => {
                                    const newReplyFormatted = {
                                        comment: newReply,
                                        userInfo: {
                                            favMLS: myUser.favMLS,
                                            favNBA: myUser.favNBA,
                                            username: myUser.username
                                        }
                                    };
                                    if (newReply && comments) {
                                        // Add comment to comments and sort
                                        comments.push(newReplyFormatted);
                                        setComments(comments.sort((a, b) => {
                                            return new Date(b.comment.date).getTime() - new Date(a.comment.date).getTime();
                                        }));
                                        setComments([...comments]);

                                        // Set reply and edit boxes
                                        setDelConfirm([false, ...delConfirm])
                                        setReplyBoxes([false, ...replyBoxes]);
                                        setEditBoxes([false, ...editBoxes]);
                                        setCloseBoxes([false, ...closeBoxes]);
                                    }
                                })}>Reply</Button>
                            </div>
                        }

                        <span id={`comment-${commentData.comment.commentId}-err`} className='comment-error-message'></span>
                    </div>
                }
            </div>
        )
    }

    // Fetch comments from areto db
    useEffect(() => {
        if (!checkedComments) {
            fetch(`/api/comments/get/${req.type}/${req.id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === 'ok') {
                        setComments(data.comments.sort((a, b) => {
                            return new Date(b.comment.date).getTime() - new Date(a.comment.date).getTime();
                        }));

                        if (data.comments) {
                            setDelConfirm(new Array(data.comments.length).fill(false));
                            setReplyBoxes(new Array(data.comments.length).fill(false));
                            setEditBoxes(new Array(data.comments.length).fill(false));
                            setCloseBoxes(new Array(data.comments.length).fill(false));
                        }
                    }
                    setCheckedComments(true);
                })
                .catch(err => {
                    console.error("Error fetching data:", err);
                });
        }
    }, [req, checkedComments]);

    return (
        <div className='comments'>
            <div className='submit-comment-container'>
                <h1>Comments</h1>
                <br />
                <textarea id='comment-text' className='comment-textarea' /><br />
                <div id='comment-err' className='comment-error-message'></div>
                <Button id='submit-comment' variant='outline-success' onClick={() => submitComment(req.type, req.id).then((newComment) => {
                    const newCommentFormatted = {
                        comment: newComment,
                        userInfo: {
                            favMLS: myUser.favMLS,
                            favNBA: myUser.favNBA,
                            username: myUser.username
                        }
                    };
                    if (newComment && comments) {
                        // Add comment to comments and sort
                        comments.push(newCommentFormatted);
                        setComments(comments.sort((a, b) => {
                            return new Date(b.comment.date).getTime() - new Date(a.comment.date).getTime();
                        }));
                        setComments([...comments]);

                        // Close new reply
                        setDelConfirm([false, ...delConfirm]);
                        setReplyBoxes([false, ...replyBoxes]);
                        setEditBoxes([false, ...editBoxes]);
                        setCloseBoxes([false, ...closeBoxes]);
                    } else if (newComment) {
                        // If single comment added, only add that one
                        setComments([newCommentFormatted]);

                        // Set replies
                        setDelConfirm([false]);
                        setReplyBoxes([false]);
                        setEditBoxes([false]);
                        setCloseBoxes([false]);
                    }
                })}>Submit</Button>
            </div>
            {comments &&
                <div className='comments-container'>
                    {comments.map(commentData => {
                        return (
                            // Make sure comment exists
                            commentData && commentData.comment.parentId === 0 && replyBoxes && editBoxes && closeBoxes &&
                            <div className='comment-section' key={commentData.comment.commentId}>
                                {generateComment(commentData, 0)}
                                {!closeBoxes[comments.indexOf(commentData)] && showReplies(comments, commentData, 0)}
                            </div>
                        );
                    })}
                </div>}
        </div>
    );
}

export default Comments;
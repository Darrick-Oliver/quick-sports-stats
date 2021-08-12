import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import { Button } from 'react-bootstrap';
import '../../css/bootstrap.min.css';
import NotFound from '../NotFound.js';
import { UserContext } from '../../App.js';

const Filter = require('bad-words'), filter = new Filter();

const PublicProfile = () => {
    const { userId } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(false);
    const [edit, setEdit] = useState(false);
    const myUser = useContext(UserContext).user;

    // Set title
    useEffect(() => {
        document.title = `${userId}'s profile`;
    }, [userId]);

    // Fetch user's comments
    useEffect(() => {
        fetch(`/api/user/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status !== 'ok')
                    setError(true);
                else {
                    data.comments = data.comments.sort((a, b) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    });

                    setUserInfo(data);
                }
            })
            .catch(err => {
                console.error("Error fetching data:", err);
            });
    }, [userId]);

    return (
        <div className='profile'>
            {error && <NotFound />}
            {!error && userInfo &&
                <div>
                    <h2>{userInfo.user.username}</h2>

                    {userId === myUser && <Button onClick={() => setEdit(!edit)}>Edit profile</Button>}
                    {edit && <h3>Editing</h3>}

                    {userInfo.comments && userInfo.comments.map(comment => {
                        return (
                            comment &&
                            <div className='user-comment' key={comment._id}>
                                <p className='tagline'>
                                    <a className='username' href={`/user/${comment.username}`}>{comment.username}</a>
                                    {' • '}
                                    <span className='date'>
                                        {new Date(comment.date).toLocaleDateString() + ' '}
                                        {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                    </span>
                                </p>
                                <div>
                                    <p id={`${comment._id}-content`} className='content'>
                                        {comment.parentId !== 'root' && <a className='user-link' href={`/user/${comment.parentUser}`}>@{comment.parentUser}</a>}
                                        {comment.parentId !== 'root' && ' '}
                                        {filter.clean(comment.content)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {!userInfo.comments && <h3>No comments</h3>}
                </div>
            }
        </div>
    );
}

export default PublicProfile;
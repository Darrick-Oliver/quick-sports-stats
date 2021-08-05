import './index.css';
import React, { useState, useEffect } from 'react';
import { useParams, Redirect } from "react-router-dom";
import NotFound from '../NotFound.js';

const Filter = require('bad-words'), filter = new Filter();

const PublicProfile = () => {
    const { userId } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(false);

    // Set title
    useEffect(() => {
        document.title = `${userId}'s profile`;
    }, []);

    // Fetch from date
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
                    console.log(data);
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
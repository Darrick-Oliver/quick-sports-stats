import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const NotFound = () => {
    useEffect(() => {
        document.title = '404 Not found';
    }, []);

    return (
        <div className='body-container'>
            <h1>404 - Page not found</h1>
            <br />
            <Link to='/'>Return home</Link>
        </div>
    );
}

export default NotFound;
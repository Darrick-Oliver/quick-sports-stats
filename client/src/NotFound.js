import React from 'react';
import { Link } from "react-router-dom";

const NotFound = () => {
    document.title = "404 Not found";

    return (
        <div className='body-container'>
            <h1>404 - Page not found</h1>
            <Link to='/'>Go home</Link>
        </div>
    );
}

export default NotFound;
import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
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
            <Link to='/'><Button variant='success'>Go home</Button></Link>
        </div>
    );
}

export default NotFound;
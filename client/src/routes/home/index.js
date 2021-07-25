import './index.css';
import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    useEffect(() => {
        document.title = 'Areto';
    }, []);

    return (
        <div className='body-container'>
            <div className='nba'></div>
            <div className='nba-title-container'>
                <Link to='/nba'><h1>NBA</h1></Link>
            </div>
            <br /><br /><br />
            <div className='mls'></div>
            <div className='mls-title-container'>
                <Link to='/mls'><h1>MLS</h1></Link>
            </div>
        </div>
    );
}

export default Home;
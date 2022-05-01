import './index.css';
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import '../../css/bootstrap.min.css';

const Home = () => {
    useEffect(() => {
        document.title = 'QuickStats';
    }, []);

    return (
        <div className='body-container'>
            <Link to='/nba'>
                <div className='body-card'>
                    <div className='nba'></div>
                    <div className='nba-title-container'>
                        <h1>NBA</h1>
                    </div>
                </div>
            </Link>
            <Link to='/mls'>
                <div className='body-card'>
                    <div className='mls'></div>
                    <div className='mls-title-container'>
                        <h1>MLS</h1>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default Home;
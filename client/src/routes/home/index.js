import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    return (
        <div className='body-container'>
            <Link to='/nba'><Button>NBA</Button></Link>
            <Link to='/mls'><Button>MLS</Button></Link>
        </div>
    );
}

export default Home;
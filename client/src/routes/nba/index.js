import React, { useState, useEffect } from 'react';
import { Nav, Tab, Col } from 'react-bootstrap';
import { useParams } from "react-router-dom";
// import './index.css';
import Scores from './scores/index.js';
import Standings from './standings/index.js';
import NBAStats from './stats/nba_stats.js';
import { useHistory, Link } from "react-router-dom";
import NotFound from '../NotFound.js';

const pages = ['scores', 'standings', 'stats']

const NBA = () => {
    const { section } = useParams();
    let history = useHistory();
    const [ sName, setSName ] = useState(null);
    const [ err, setErr ] = useState(false);

    useEffect(() => {
        setErr(false);
        if (!section) {
            history.push('/nba/scores');
        } else if (pages.includes(section.toLowerCase())) {
            document.title = `NBA ${section.toLowerCase()}`;
            setSName(section.toLowerCase());
        } else {
            setSName(null);
            setErr(true)
        }
    }, [section, history]);

    return (
        <div>
            {err && <NotFound />}
            {sName && !err &&
                <Tab.Container defaultActiveKey={sName}>
                    <div className='mls-nav'>
                        <Nav variant='pills'>
                            <Nav.Item>
                                <Nav.Link as={Link} to='/nba/scores' eventKey='scores'>Scores</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link as={Link} to='/nba/standings' eventKey='standings' className='move-button'>Standings</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link as={Link} to='/nba/stats' eventKey='stats' className='move-button'>Player stats</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                    <Col>
                        <Tab.Content>
                            <Tab.Pane eventKey='scores'>
                                <Scores />
                            </Tab.Pane>
                            <Tab.Pane eventKey='standings'>
                                <Standings />
                            </Tab.Pane>
                            <Tab.Pane eventKey='stats'>
                                <NBAStats />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Tab.Container>
            }
        </div>
    );
}

export default NBA;
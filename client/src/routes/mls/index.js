import React, { useState, useEffect } from 'react';
import { Nav, Tab, Col } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import './index.css';
import Scores from './scores/index.js';
import Standings from './standings/index.js';
import { useHistory, Link } from "react-router-dom";
import NotFound from '../NotFound.js';

const MLS = () => {
    const { section } = useParams();
    let history = useHistory();
    const [ sName, setSName ] = useState(null);
    const [ err, setErr ] = useState(false);

    useEffect(() => {
        setErr(false);
        if (!section) {
            history.push('/mls/scores');
        } else if (section.toLowerCase() === 'scores' || section.toLowerCase() === 'standings') {
            document.title = `MLS ${section.toLowerCase()}`;
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
                                    <Nav.Link as={Link} to='/mls/scores' eventKey='scores'>Scores</Nav.Link>
                                </Nav.Item>
                            <Nav.Item>
                                <Nav.Link as={Link} to='/mls/standings' eventKey='standings' className='move-button'>Standings</Nav.Link>
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
                        </Tab.Content>
                    </Col>
                </Tab.Container>
            }
        </div>
    );
}

export default MLS;
import './nba_scores.css';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../../../css/bootstrap.min.css';
import BoxScore from './BoxScore.js';
import Comments from '../../../comments.js';
import { NBAteams } from '../../../teams';

import navigateRightIcon from '../resources/navigate_next.svg';
import navigateLeftIcon from'../resources/navigate_before.svg';

let selectedDate = new Date();
let navDate = new Date();
const currDate = new Date();
const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];

const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/nba_logos/${name}.svg`;
}

const getGameTime = (time) => {
    return new Date(time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

const getStatus = (game) => {
    try {
        if (!game.status.type.completed && game.status.type.state === 'pre')
            return <h3>{getGameTime(game.date)}</h3>
        else if (!game.status.type.completed)
            return <h3 style={{ color: 'red', fontWeight: 'bold' }}>{'Q' + game.status.period + ' ' + game.status.displayClock}</h3>;
        else
            return <h3>Final</h3>
    } catch (err) {
        // Really stupid
        return <h3>{err}</h3>
    }
}

const idFromEId = (eId) => {
    for (let i = 0; i < NBAteams.length; i += 1) {
        if (NBAteams[i].eId === eId) {
            return NBAteams[i].id;
        }
    }
    return null;
}

const Scores = () => {
    const [data, setData] = useState(null);
    const [queryURL, setQueryURL] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [giTemp, setGITemp] = useState(null);
    const [errmsg, setErrmsg] = useState(null);
    const [gameInfo, setGameInfo] = useState(null);
    const [boxClicked, setBoxClicked] = useState(false);
    const [refreshDate, setRefreshDate] = useState(false);

    // Set title
    useEffect(() => {
        document.title = 'NBA Scores';
    }, []);

    // Box score button handler
    const boxPress = (game) => {
        const url = `/api/nba/boxscore/${game.id}`;
        setGameInfo(null);
        setGameData(null);
        setGITemp(game);

        if (queryURL !== url) {
            setQueryURL(url);
            setBoxClicked(true);
        }
        else {
            setQueryURL(null);
            setBoxClicked(false);
        }
    }

    // Day press handler
    const dayPress = (newDate) => {
        selectedDate = newDate;
        navDate = newDate;
        
        // Set all others to null
        setGameData(null);
        setData(null);
        setQueryURL(null);
        setErrmsg(null);
        setBoxClicked(false);
        setGameInfo(null);
    }

    // Week press handler
    const weekPress = (where) => {
        let diff = where === 'start' ? 7 : -7;

        // Get day
        let first = new Date(navDate);
        const firstDiff = first.getDate() + diff;
        first.setDate(firstDiff);

        // Set current date
        navDate = first;
        
        // Re render
        setRefreshDate(!refreshDate);
    }

    // Set date to today
    const dateToday = () => {
        if (data) {
            selectedDate.setTime(currDate.getTime());
            navDate.setTime(currDate.getTime());
            setGameData(null);
            setData(null);
            setErrmsg(null);
            setBoxClicked(false);
            setGameInfo(null);
        }
    }

    // Fetch from date
    useEffect(() => {
        if (!data) {
            const month = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
            const day = ("0" + selectedDate.getDate()).slice(-2);
            const year = selectedDate.getFullYear();

            fetch(`/api/nba/date/${month}${day}${year}`)
                .then((res) => res.json())
                .then((data) => {
                    setData(data.data);
                    if (data.status !== 'ok')
                        setErrmsg(data.error);
                })
                .catch(err => {
                    console.error("Error fetching data:", err);
                    console.error(data);
                });
        }
    }, [data]);

    // Fetch box score
    useEffect(() => {
        if (queryURL) {
            fetch(queryURL)
                .then((res) => res.json())
                .then((gameData) => {
                    setGameInfo(giTemp);
                    if (gameData.status === 'ok')
                        setGameData(gameData.data);
                    else
                        setErrmsg("Box score unavailable");
                })
                .catch(err => {
                    console.error("Error fetching data: ", err);
                });
        }
    }, [queryURL, giTemp]);

    // Render calendar controls
    const renderControls = () => {
        // Get days in week to loop over
        let week = [];
        for (let i = 0; i < 7; i += 1)
            week.push(i);
        
        return (
            <div className='controls'>
                <img className='controls-week-navigation' src={navigateLeftIcon} alt='Back 1 week' onClick={() => {weekPress('end')}} />
                {week.map((day) => {
                    // Get first day
                    let first = new Date(navDate);
                    const firstDiff = first.getDate() - first.getDay();
                    first.setDate(firstDiff);

                    // Increment date to match date
                    first.setDate(first.getDate() + day);

                    // Determine if date is selected
                    let classes = first.toDateString() === selectedDate.toDateString() ? 'calendar-button-selected round' : 'calendar-button round';

                    return (
                        <button key={`calendar-day-${day}`} id={`calendar-day-${day}`} className={classes} onClick={() => {dayPress(first)}}>
                            <div style={{fontSize: 10}}>{first.getDate()}</div>
                            <div>{days[first.getDay()]}</div>
                        </button>
                    )
                })}
                <img className='controls-week-navigation' src={navigateRightIcon} alt='Forward 1 week' onClick={() => {weekPress('start')}} />
            </div>
        )
    }

    return (
        <div className='score-content'>
            <h4 className='calendar-header' onClick={() => {dateToday()}}>{navDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
            {renderControls()}
            <div className='games'>{!data ? '' : (
                data.games.map(game => {
                    return (
                        <div key={game.id}>
                            <h2>
                                <img src={getImage(idFromEId(game.competitors[0].id))} alt={game.competitors[0].team.displayName} height='50'></img>
                                {game.competitors[0].team.abbreviation} vs {game.competitors[1].team.abbreviation}
                                <img src={getImage(idFromEId(game.competitors[1].id))} alt={game.competitors[1].team.displayName} height='50'></img>
                            </h2>
                            <p>{game.competitors[0].score} : {game.competitors[1].score}</p>
                            {getStatus(game)}
                            <Button variant='dark' onClick={() => boxPress(game)}>Box Score</Button>{' '}
                        </div>
                    );
                })
            )}</div>
            {(!data || (boxClicked && (!gameData && !errmsg))) && <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' />}

            <div className='boxscore'>
                {gameData && boxClicked && <span><hr className='separator' /><br /></span>}
                {!gameData ? (errmsg === 'No games scheduled' ? <h2>{errmsg}</h2> : boxClicked && <h2 style={{marginTop: 20}}>{errmsg}</h2>)
                    : <BoxScore gameData={gameData} />}
            </div>
            {gameData && boxClicked && <hr className='separator' />}
            {boxClicked && gameInfo && <Comments id={gameInfo.id} type='nba' />}
        </div>
    );
}

export default Scores;
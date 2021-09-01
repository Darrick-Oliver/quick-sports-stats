/* eslint-disable eqeqeq */
import './mls_scores.css';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../../../css/bootstrap.min.css';
import Comments from '../../../comments.js';
import BoxScore from './BoxScore.js';

import navigateRightIcon from '../../nba/resources/navigate_next.svg';
import navigateLeftIcon from'../../nba/resources/navigate_before.svg';

let selectedDate = new Date();
let navDate = new Date();
const currDate = new Date();
const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];

// Gets requested logo from public folder
const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/mls_logos/${name}.svg`;
}

// Returns the score of the game
const getScore = (scoreboard, id) => {
    // Get corresponding scoreboard for game id
    const gameInd = scoreboard.findIndex((f) => { return f.game_id == id; });
    if (gameInd > -1) {
        // Scoreboard found
        const gameScore = scoreboard[gameInd];
        return <p>{gameScore.home_club_match.score ? gameScore.home_club_match.score : 0} : {gameScore.away_club_match.score ? gameScore.away_club_match.score : 0}</p>;
    } else {
        // Still fetching scoreboard
        return <p>Fetching...</p>;
    }
}

// Returns the game status
const getStatus = (scoreboard, id) => {
    const gameInd = scoreboard.findIndex((f) => { return f.game_id == id; })
    if (gameInd > -1) {
        const gameScore = scoreboard[gameInd];
        if (gameScore.period === 'FullTime')
            return <h3>Final</h3>;
        else if (gameScore.period === 'PreMatch')
            return <h3>{new Date(gameScore.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</h3>;
        else if (gameScore.minute_display)
            return <h3 style={{ color: 'red', fontWeight: 'bold' }}>{gameScore.minute_display}</h3>
        else if (gameScore.period === 'Postponed')
        return <h3 style={{ color: 'red' }}>Postponed</h3>;
    } else {
        return;
    }
}

const Scores = () => {
    const [data, setData] = useState(null);
    const [queryURL, setQueryURL] = useState(null);
    const [scoreboards, setScoreboards] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [giTemp, setGITemp] = useState(null);
    const [gameInfo, setGameInfo] = useState(null);
    const [errmsg, setErrmsg] = useState(null);
    const [boxClicked, setBoxClicked] = useState(false);
    const [refreshDate, setRefreshDate] = useState(false);

    // Box score button handler
    const boxPress = (game) => {
        const url = `/api/mls/game/${game.optaId}/boxscore`;
        setGameData(null);
        setGameInfo(null);
        if (queryURL !== url) {
            setQueryURL(url);
            setGITemp(game);
            setBoxClicked(true);
        } else {
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
        setErrmsg(null);
        setScoreboards(null);
        setGameInfo(null);
        setBoxClicked(false);
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
            setScoreboards(null);
            setGameInfo(null);
            setBoxClicked(false);
        }
    }
    
    // Fetch games data from date
    useEffect(() => {
        if (!data) {
            const month = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
            const day = ("0" + selectedDate.getDate()).slice(-2);
            const year = selectedDate.getFullYear();
            const url = `/api/mls/date/${month}${day}${year}`;

            fetch(url)
                .then((res) => res.json())
                .then((res) => {
                    if (res.status !== 'ok')
                        setErrmsg(res.error);

                    for (let i = 0; i < res.data.length; i += 1) {
                        if (new Date(res.data[i].matchDate).toLocaleDateString() !== selectedDate.toLocaleDateString()) {
                            res.data.splice(i, 1);
                            i -= 1;
                        }
                    }
                    if (res.data.length === 0)
                        setErrmsg('No games scheduled');

                    setData(res.data);
                })
                .catch(err => {
                    console.error("Error fetching data:", err);
                    console.error(data);
                });
        }
    }, [data]);

    // Fetch all scoreboards
    useEffect(() => {
        if (data && !scoreboards) {
            let score = [];
            data.map((game, i) => {
                fetch(`/api/mls/game/${game.optaId}`)
                    .then((res) => res.json())
                    .then((res) => {
                        score = [...score, res.data];
                    }).then(() => {
                        setScoreboards(score);
                    });
                return 0;
            });
        }
    }, [data, scoreboards]);

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
            <div className='games'>{data && scoreboards && (
                data.map(game => {
                    return (
                        <div key={game.optaId}>
                            <h2>
                                <img src={getImage(game.home.abbreviation)} alt={game.home.abbreviation} height='50'></img>
                                {game.home.abbreviation} vs {game.away.abbreviation}
                                <img src={getImage(game.away.abbreviation)} alt={game.away.abbreviation} height='50'></img>
                            </h2>
                            {scoreboards && getScore(scoreboards, game.optaId)}
                            {scoreboards && getStatus(scoreboards, game.optaId)}
                            <Button variant='dark' onClick={() => boxPress(game)}>Box Score</Button>
                        </div>
                    );
                })
            )}</div>

            {(!data || (boxClicked && !gameInfo)) && <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' />}

            <div className='boxscore'>
                {gameData && boxClicked && <span><hr className='separator' /><br /></span>}
                {!gameData ? (errmsg === 'No games scheduled' ? <h2>{errmsg}</h2> : boxClicked && <h2 style={{marginTop: 20}}>{errmsg}</h2>)
                    : gameInfo && <BoxScore gameData={gameData} gameInfo={gameInfo} />}
            </div>
            {gameData && boxClicked && <hr className='separator' />}
            {boxClicked && gameInfo && <Comments id={gameInfo.optaId} type='mls' />}
        </div>
    );
}

export default Scores;
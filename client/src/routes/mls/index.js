/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Comments from '../../comments.js';
import BoxScore from './BoxScore.js';

let dateObj = new Date();
const currDate = new Date();

const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/mls_logos/${name}.svg`;
}

const getScore = (scoreboard, id) => {
    // Must be == instead of === because one is int, other is string
    const gameInd = scoreboard.findIndex((f) => { return f.game_id == id; });
    if (gameInd > -1) {
        const gameScore = scoreboard[gameInd];
        return <p>{gameScore.home_club_match.score ? gameScore.home_club_match.score : 0} : {gameScore.away_club_match.score ? gameScore.away_club_match.score : 0}</p>;
    } else {
        return <p>Fetching...</p>;
    }
}

const getStatus = (scoreboard, id) => {
    const gameInd = scoreboard.findIndex((f) => { return f.game_id == id; })
    if (gameInd > -1) {
        const gameScore = scoreboard[gameInd];
        if (gameScore.period === 'FullTime')
            return <h3>Final</h3>;
        else if (gameScore.period === 'PreMatch')
            return <h3>{new Date(gameScore.date).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</h3>
    } else {
        return;
    }
}

const MLS = () => {
    const [data, setData] = useState(null);
    const [queryURL, setQueryURL] = useState(null);
    const [scoreboards, setScoreboards] = useState([null]);
    const [gameData, setGameData] = useState(null);
    const [giTemp, setGITemp] = useState(null);
    const [gameInfo, setGameInfo] = useState(null);
    const [date, setDate] = useState(null);
    const [errmsg, setErrmsg] = useState(null);
  
    // Initialize date
    if (!date)
        setDate(dateObj.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}));

    // Set title
    useEffect(() => {
        document.title = 'MLS Scores';
    }, []);
  
    // Box score button handler
    const boxPress = (game) => {
        const url = `/api/mls/game/${game.optaId}/boxscore`;
        if (queryURL !== url) {
            setQueryURL(url);
            setGITemp(game);
        } else {
            setGameData(null);
            setGameInfo(null);
            setQueryURL(null);
        }
    }
  
    // Date buttons handler
    const datePress = (dir) => {
        if (data) {
            dateObj.setDate(dateObj.getDate() + dir);
            setDate(dateObj.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}));
            setGameData(null);
            setData(null);
            setErrmsg(null);
            setScoreboards(null);
            setGameInfo(null);
        }
    }
  
    // Set date to today
    const dateToday = () => {
        if (data) {
            dateObj.setTime(currDate.getTime());
            setDate(dateObj.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}));
            setGameData(null);
            setData(null);
            setErrmsg(null);
            setScoreboards(null);
            setGameInfo(null);
        }
    }
  
    // Fetch from date
    useEffect(() => {
        if (!data) {
            const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
            const day = ("0" + dateObj.getDate()).slice(-2);
            const year = dateObj.getFullYear();
            const url =  `/api/mls/date/${month}${day}${year}`;

            fetch(url)
            .then((res) => res.json())
            .then((res) => {
                if (res.status !== 'ok')
                    setErrmsg(res.error);
                
                for (let i = 0; i < res.data.length; i += 1) {
                    if (new Date(res.data[i].matchDate).toLocaleDateString() !== dateObj.toLocaleDateString()) {
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
                if (gameData.status === 'ok') {
                    setGameData(gameData.data);
                    setGameInfo(giTemp);
                }
                else
                    setErrmsg("Box score unavailable");
            })
            .catch(err => {
                console.error("Error fetching data: ", err);
            });
        }
    }, [queryURL]);

    return (
        <div className='body-container'>
            <span id='controls'>
                <Button variant='success' onClick={() => datePress(-7)} title='Back 1 week'>{"<<"}</Button>{' '}
                <Button variant='success' onClick={() => datePress(-1)} title='Back 1 day'>{"<"}</Button>
                <Button variant='link' style={{color: 'black'}} onClick={() => dateToday()}>{ date === new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit'
                }) ? 'Today' : date }</Button>
                <Button variant='success' onClick={() => datePress(1)} title='Forward 1 day'>{">"}</Button>{' '}
                <Button variant='success' onClick={() => datePress(7)} title='Forward 1 week'>{">>"}</Button>
            </span>
            <br />
            { !data && <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' /> }
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

            <div className='boxscore'>
                { gameData && <span><hr className='separator' /><br /></span> }
                { !gameData ? errmsg && <span><br /><h2>{errmsg}</h2></span> : gameInfo && <BoxScore gameData={gameData} gameInfo={gameInfo} /> }
            </div>
            {/* { gameData && <hr className='separator' /> }
            { gameData && <Comments gameData={gameData} /> } */}
        </div>
    );
}

export default MLS;
import './App.css';
import React, { useState, useEffect } from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BoxScore from './BoxScore.js';
import Login from './Login.js';
import { submitComments, displayComments } from './comments.js';

let dateObj = new Date();
const currDate = new Date();

const getImage = (name) => {
  return `${process.env.PUBLIC_URL}/assets/images/${name}.svg`;
}

const getGameTime = (game) => {
  return new Date(game.gameTimeUTC).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

const getStatus = (game) => {
  let status = game.gameStatusText;
  if (status.includes('ET'))
      status = getGameTime(game);
  else if (status.includes('PT')) {
      let quarter = status.match(/Q\d/)[0];
      let minutes = status.match(/PT\d\d/)[0].match(/\d\d/)[0];
      let seconds = status.match(/M\d\d/)[0].match(/\d\d/)[0];
      return <h3 style={{color: 'red', fontWeight: 'bold'}}>{quarter + ' ' + minutes + ':' + seconds}</h3>;
  }
  else if (status.includes('Q') || status.includes('Half'))
      return <h3 style={{color: 'red', fontWeight: 'bold'}}>{status}</h3>

  return <h3>{status}</h3>;
}

const App = () => {
  const [data, setData] = useState(null);
  const [queryURL, setQueryURL] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [date, setDate] = useState(null);
  const [errmsg, setErrmsg] = useState(null);
  const [comments, setComments] = useState(null);
  
  const api_url = `/api/nba`;

  // Initialize date
  if (!date)
    setDate(dateObj.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}));

  // Box score button handler
  const boxPress = (game) => {
    const url = `${api_url}/${game.gameId}`;
    if (queryURL !== url)
      setQueryURL(url);
    else {
      setGameData(null);
      setQueryURL(null);
    }
    setComments(null);
  }

  // Date buttons handler
  const datePress = (dir) => {
    dateObj.setDate(dateObj.getDate() + dir);
    setDate(dateObj.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}));
    setGameData(null);
    setData(null);
    setQueryURL(null);
    setErrmsg(null);
    setComments(null);
  }

  const dateToday = () => {
    dateObj.setTime(currDate.getTime());
    setDate(dateObj.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}));
    setGameData(null);
    setData(null);
    setErrmsg(null);
    setComments(null);
  }

  // Fetch from date
  useEffect(() => {
    if (!data) {
      let url = '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit'};
      
      const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
      const day = ("0" + dateObj.getDate()).slice(-2);
      const year = dateObj.getFullYear();

      if (dateObj.toLocaleString('en-US', options) === currDate.toLocaleString('en-US', options)) {
        url = api_url;
      } else {
        url =  `${api_url}/date/${month}${day}${year}`;
      }

      fetch(url)
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
  }, [api_url, data]);
    
  // Fetch box score
  useEffect(() => {
    if (queryURL) {
      fetch(queryURL)
        .then((res) => res.json())
        .then((gameData) => {
          if (gameData.status === 'ok') {
            setGameData(gameData.data);
          }
          else
            setErrmsg("Box score unavailable");
        })
        .catch(err => {
          console.error("Error fetching data: ", err);
        });
    }
  }, [queryURL]);

  // Fetch comments (WIP)
  useEffect(() => {
    if (gameData) {
      fetch(`/api/comments/${gameData.gameId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'ok') {
            setComments(data.comments);
          }
        })
        .catch(err => {
          console.error("Error fetching data:", err);
        });
    }
  }, [gameData]);

  return (
    <div className="App">
      <div className="top">
        <h1>NBA Scores</h1>
        <Login />
      </div>

      <br style={{clear: 'both'}} />
      <div className="nba">
        <span id='controls'>
          <Button variant='success' onClick={() => datePress(-7)} title='Back 1 week'>{"<<"}</Button>{' '}
          <Button variant='success' onClick={() => datePress(-1)} title='Back 1 day'>{"<"}</Button>
          <Button variant='link' style={{color: 'black'}} onClick={() => dateToday()}>{ date === new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}) ? "Today" : date }</Button>
          <Button variant='success' onClick={() => datePress(1)} title='Forward 1 day'>{">"}</Button>{' '}
          <Button variant='success' onClick={() => datePress(7)} title='Forward 1 week'>{">>"}</Button>
        </span>
        <br />
        { !data && <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' /> }
        <div className="games">{!data ? '' : (
          data.games.map(game => {
            return (
              <div key={game.gameId}>
                <h2><img src={getImage(game.homeTeam.teamId)} alt={game.homeTeam.teamName} height='50'></img> {game.homeTeam.teamTricode} vs {game.awayTeam.teamTricode} <img src={getImage(game.awayTeam.teamId)} alt={game.awayTeam.teamName} height='50'></img></h2>
                <p>{game.homeTeam.score} : {game.awayTeam.score}</p>
                {getStatus(game)}
                <Button variant="dark" onClick={() => boxPress(game)}>Box Score</Button>{' '}
              </div>
            );
          })
        )}
        </div>

        <div className="boxscore">
          { gameData && <span><hr className='separator' /><br /></span> }
          { !gameData ? errmsg && <span><br /><h2>{errmsg}</h2></span> : BoxScore(gameData) }
        </div>
        { gameData && <hr className='separator' /> }
        { gameData && submitComments(gameData.gameId) }
        { comments && displayComments(comments) }
      </div>
    </div>
  );
}

export default App;
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './css/bootstrap.min.css';
import Login from './Login.js';
import NBA from './routes/nba/index.js';
import MLS from './routes/mls/index.js';
import Home from './routes/home/index.js';
import Profile from './routes/profile/index.js';
import NotFound from './routes/NotFound.js';

const App = () => {
  return (
    <div className='App'>
      <Router>
        <div className='top'>
          <Link to='/'><h1>Areto Fantasy</h1></Link>
          <Login />
        </div>
        <Switch>
          <Route exact path='/nba' component={NBA} />
          <Route exact path='/mls' component={MLS} />
          <Route exact path='/' component={Home} />
          <Route exact path='/my-profile' component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
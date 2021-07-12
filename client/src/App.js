import './App.css';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login.js';
import NBA from './routes/nba/index.js';
import Home from './routes/home/index.js';
import NotFound from './NotFound.js';

const App = () => {
  return (
    <div className='App'>
      <Router>
        <div className='top'>
          <h1>Areto Fantasy</h1>
          <Login />
        </div>
        
        <Switch>
          <Route exact path="/nba" component={NBA} />
          <Route exact path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './css/bootstrap.min.css';
import Login from './Login.js';
import NBA from './routes/nba/index.js';
import MLS from './routes/mls/index.js';
import Home from './routes/home/index.js';
import Profile from './routes/edit-profile/index.js';
import PublicProfile from './routes/public-profile/index.js';
import NotFound from './routes/NotFound.js';

export const UserContext = React.createContext({
  user: null,
  setUser: () => {},
  admin: null,
  setAdmin: () => {}
});

const App = () => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(false);
    const value = { user, setUser, admin, setAdmin };

    // Get user info from server
    useEffect(() => {
        fetch('/api/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setUser(data.user.username);
                    setAdmin(data.user.admin);
                }
            })
            .catch(err => {
                console.error("Error fetching login data:", err);
            });
    }, []);

    return (
        <div className='App'>
            <Router>
                    <UserContext.Provider value={value}>
                        <div className='top'>
                            <Link to='/'><h1>Areto Fantasy</h1></Link>
                            <Login />
                        </div>
                        <Switch>
                            <Route exact path='/nba' component={NBA} />
                            <Route exact path='/mls' component={MLS} />
                            <Route exact path='/' component={Home} />
                            <Route exact path='/edit-profile' component={Profile} />
                            <Route path='/user/:userId' component={PublicProfile} />
                            <Route component={NotFound} />
                        </Switch>
                </UserContext.Provider>
            </Router>
        </div>
    );
}

export default App;
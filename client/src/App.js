import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './css/bootstrap.min.css';
import Login from './Login.js';
import NBA from './routes/nba/nba_index.js';
import MLS from './routes/mls/mls_index.js';
import Home from './routes/home/index.js';
import PublicProfile from './routes/public-profile/public_profile.js';
import CommentContext from './routes/comment-context/comment_context.js';
import NotFound from './routes/NotFound.js';
import Footer from './footer.js';

export const UserContext = React.createContext({
  user: null,
  setUser: () => {}
});

const App = () => {
    const [user, setUser] = useState(null);
    const value = { user, setUser };

    // Get user info from server
    useEffect(() => {
        fetch('/api/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setUser(JSON.stringify(data.user));
                }
            })
            .catch(err => {
                console.error("Error fetching login data:", err);
            });
    }, []);

    return (
        <div className='App wrapper'>
            <Router>
                <UserContext.Provider value={value}>
                    <div className='top'>
                        <Link to='/'><h1>QuickStats</h1></Link>
                        <Login />
                    </div>
                    <div className='main-content'>
                        <Switch>
                            <Route exact path='/nba' component={NBA} />
                            <Route path='/nba/:section' component={NBA} />
                            <Route exact path='/mls' component={MLS} />
                            <Route path='/mls/:section' component={MLS} />
                            <Route exact path='/' component={Home} />
                            <Route exact path='/user/:userId' component={PublicProfile} />
                            <Route exact path='/comments/d/:commentId' component={CommentContext} />
                            <Route component={NotFound} />
                        </Switch>
                    </div>
                    <Footer />
                </UserContext.Provider>
            </Router>
        </div>
    );
}

export default App;
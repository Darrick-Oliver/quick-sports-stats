const express = require("express");
const fetch = require("node-fetch");
const template = require("nba-client-template");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require('./model/user');
// const { requireAuth, checkUser } = require('./middleware/authMiddleware');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost:27017/login-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("Connected to MongoDB")).catch(err => console.error(`Error connecting to MongoDB: ${err}`));

const app = express();
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`) );
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

// NBA get scoreboard today
app.get('/api/nba', async (req, res) => {
    const api_url='https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();

        // Check game data
        if (!json.scoreboard.games.length) {
            return res.json({ status: 'error', error: 'No games scheduled', data: {games: []} });
        }
        console.log("Fetched scoreboard");
    } catch (err) {
        console.log(err);
        return res.json({ status: 'error', error: err, data: {games: []} });
    }

    return res.json({ status: 'ok', data: json.scoreboard });
});

// NBA get (game specific)
app.get('/api/nba/:gameId', async (req, res) => {
    const api_url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${req.params.gameId}.json`;
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();
        console.log(`Fetched ${req.params.gameId}`);
    } catch (err) {
        console.log(err);
        return res.json({ status: 'error', error: err, data: null });
    }

    return res.json({ status: 'ok', data: json.game });
});

// NBA get scoreboard by date
const templateHeaders = () => ({ ...template.headers })
app.get('/api/nba/date/:date', async (req, res) => {
    const date = `${req.params.date.slice(4)}-${req.params.date.slice(0,2)}-${req.params.date.slice(2,4)}`;
    const api_url = `https://stats.nba.com/stats/scoreboardv3?GameDate=${date}&LeagueID=00`;
    let json = null;
    try {
        const options = {
            headers: templateHeaders()
        };
        const fetch_response = await fetch(api_url, options);
        json = await fetch_response.json();

        // Check game data
        if (!json.scoreboard.games.length) {
            return res.json({ status: 'error', error: 'No games scheduled', data: {games: []} });
        }
        console.log(`Fetched ${req.params.date}`);
    } catch (err) {
        console.log(err);
        return res.json({ status: 'error', error: err, data: {games: []} });
    }

    return res.json({ status: 'ok', data: json.scoreboard });
});

// Register account
app.post('/api/register', async (req, res) => {
    const { username, email, pass } = req.body;

    // Error checking
    if (!username || typeof username !== 'string') {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Invalid username'
        })
    }
    if (!email || typeof email !== 'string') {
        return res.json({
            status: 'error',
            type: 'email',
            error: 'Invalid email'
        })
    }
    if (!pass || typeof pass !== 'string') {
        return res.json({
            status: 'error',
            type: 'password',
            error: 'Invalid password'
        })
    }
    if (pass.length < 6) {
        return res.json({
            status: 'error',
            type: 'password',
            error: 'Password too short. Should be at least 6 characters.'
        })
    }
    if (username.length < 4) {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Username too short. Should be at least 4 characters.'
        })
    }
    if (username.length > 20) {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Username too long. Should be no more than 20 characters.'
        })
    }

    // Hash password
    const password = await bcrypt.hash(pass, 10);

    // Attempt to create user in database
    try {
        const response = await User.create({
            username,
            email,
            password
        });
        console.log(`${username} has been created`);
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key
            if (err.keyPattern.username) {
                return res.json({
                    status: 'error',
                    type: 'username',
                    error: 'Username already in use'
                });
            }
            else if (err.keyPattern.email) {
                return res.json({
                    status: 'error',
                    type: 'email',
                    error: 'Email already in use'
                });
            }
        }
        // Unknown error
        console.log(err);
    }

    return res.json({ status: 'ok' });
});

// Log in to account
app.post('/api/login', async (req, res) => {
    const { username, email, password } = req.body;
    let user = null;

    if (!username && !email) {
        return res.json({ status: 'error', error: 'Invalid username/password' });
    }

    if (!email)
        user = await User.findOne({username: username}).lean();
    else if (!username)
        user = await User.findOne({email: email}).lean();

    if (!user) {
        return res.json({status: 'error', error: 'Invalid username/password'});
    }
    if (user && await bcrypt.compare(password, user.password)) {
        // Passwords match
        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, process.env.JWT_SECRET, {
            expiresIn: '3d'
        });
        const maxAge = 3 * 24 * 60 * 60; // 3 days (in seconds)

        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        return res.json({ status: 'ok', data: token });
    }

    return res.json({ status: 'error', error: 'Invalid username/password' });
});

// Log out of account
app.get('/api/logout', async (req, res) => {
    // Return a 1ms maxAge cookie
    res.cookie('jwt', '', { maxAge: 1 });
    return res.json({ status: 'ok' });
});

// Return user info
app.get('/api/me', async (req, res) => {
    // Get cookies from header
    let cookies = req.headers.cookie;

    if (cookies) {
        // Extract jwt token from cookies
        let token = null;
        const value = `; ${cookies}`;
        const parts = value.split('; jwt=');
        if (parts.length === 2)
            token = parts.pop().split(';').shift();
        else
            return res.json({ status: 'error', error: 'Not logged in', user: null });

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.json({ status: 'error', error: err.message, user: null });
            } else {
                const user = await User.findById(decodedToken.id);
                console.log(`Fetched ${user.username}`);
                return res.json({ status: 'ok', user: user.username });
            }
        });
    } else {
        return res.json({ status: 'error', error: 'Not logged in', user: null });
    }
});

// Log in to account
app.post('/api/comment', async (req, res) => {
    const { username, content, gameId } = req.body;

    // Error checking
    if (!username || typeof username !== 'string') {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Invalid username'
        })
    }
    if (!content || typeof content !== 'string') {
        return res.json({
            status: 'error',
            type: 'content',
            error: 'Invalid content'
        })
    }

    return res.json({ status: 'error', error: 'Invalid username/password' });
});
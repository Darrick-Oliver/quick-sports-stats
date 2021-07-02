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
app.get('/api/nba', async (request, response) => {
    const api_url='https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();
        console.log("Fetched scoreboard");
    } catch (err) {
        console.log(err);
    }

    response.json(json);
});

// NBA get (game specific)
app.get('/api/nba/:gameId', async (request, response) => {
    const api_url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${request.params.gameId}.json`;
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();
        console.log(`Fetched ${request.params.gameId}`);
    } catch (err) {
        console.log(err);
    }

    return response.json(json);
});

// NBA get scoreboard by date
const templateHeaders = () => ({ ...template.headers })
app.get('/api/nba/date/:date', async (request, response) => {
    const date = `${request.params.date.slice(4)}-${request.params.date.slice(0,2)}-${request.params.date.slice(2,4)}`;
    const api_url = `https://stats.nba.com/stats/scoreboardv3?GameDate=${date}&LeagueID=00`;
    let json = null;
    try {
        const options = {
            headers: templateHeaders()
        };
        const fetch_response = await fetch(api_url, options);
        json = await fetch_response.json();
        console.log(`Fetched ${request.params.date}`);
    } catch (err) {
        console.log(err);
    }

    response.json(json);
});

// Register account
app.post('/api/register', async (request, response) => {
    const { username, email, pass } = request.body;

    // Error checking
    if (!username || typeof username !== 'string') {
        return response.json({
            status: 'error',
            type: 'username',
            error: 'Invalid username'
        })
    }
    if (!email || typeof email !== 'string') {
        return response.json({
            status: 'error',
            type: 'email',
            error: 'Invalid email'
        })
    }
    if (!pass || typeof pass !== 'string') {
        return response.json({
            status: 'error',
            type: 'password',
            error: 'Invalid password'
        })
    }
    if (pass.length < 6) {
        return response.json({
            status: 'error',
            type: 'password',
            error: 'Password too short. Should be at least 6 characters.'
        })
    }

    // Hash password
    const password = await bcrypt.hash(pass, 10);

    // Attempt to create user in database
    try {
        const res = await User.create({
            username,
            email,
            password
        });
        console.log(res);
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key
            if (err.keyPattern.username) {
                return response.json({
                    status: 'error',
                    type: 'username',
                    error: 'Username already in use'
                });
            }
            else if (err.keyPattern.email) {
                return response.json({
                    status: 'error',
                    type: 'email',
                    error: 'Email already in use'
                });
            }
        }
        // Hmm
        throw err;
    }

    response.json({ status: 'ok' });
});

// Log in to account
app.post('/api/login', async (request, response) => {
    const { username, email, password } = request.body;
    let user = null;

    if (!username && !email) {
        return response.json({ status: 'error', error: 'Invalid username/password' });
    }

    if (!email)
        user = await User.findOne({username: username}).lean();
    else if (!username)
        user = await User.findOne({email: email}).lean();

    if (!user) {
        return response.json({status: 'error', error: 'Invalid username/password'});
    }
    if (user && await bcrypt.compare(password, user.password)) {
        // Passwords match
        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        const maxAge = 3 * 24 * 60 * 60; // 3 days (in seconds)

        response.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        return response.json({ status: 'ok', data: token });
    }

    return response.json({ status: 'error', error: 'Invalid username/password' });
});

// Log out of account
app.get('/api/logout', async (request, response) => {
    response.cookie('jwt', '', { maxAge: 1 });
    return response.json({ status: 'ok' });
});

// Return user info
app.get('/api/me', async (req, res) => {
    let token = req.headers.cookie;
    if (token) {
        jwt.verify(token.slice(4), process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.json({ status: 'error', error: err.message, user: null });
            } else {
                const user = await User.findById(decodedToken.id);
                return res.json({ status: 'ok', user: user.username });
            }
        });
    } else {
        return res.json({ status: 'error', error: 'Not logged in', user: null });
    }
});
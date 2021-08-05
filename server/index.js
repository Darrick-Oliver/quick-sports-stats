const express = require("express");
const fetch = require("node-fetch");
const template = require("nba-client-template");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require('./model/user');
const Comment = require('./model/comment');
const { requireAuth } = require('./middleware/authMiddleware');

const COMMENT_MAXLEN = 500;

require('dotenv').config();

const PORT = process.env.PORT || 3001;

mongoose.connect(`mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PASS}@areto-db.f2kke.mongodb.net/areto-main?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("Connected to MongoDB")).catch(err => console.error(`Error connecting to MongoDB: ${err}`));

const app = express();
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.resolve(__dirname, '../client/build')));

// NBA get scoreboard today
app.get('/api/nba', async (req, res) => {
    const api_url = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();

        // Check game data
        if (!json.scoreboard.games.length) {
            return res.json({ status: 'error', error: 'No games scheduled', data: { games: [] } });
        }
    } catch (err) {
        return res.json({ status: 'error', error: err, data: { games: [] } });
    }

    return res.json({ status: 'ok', data: json.scoreboard });
});

// NBA get boxscore
app.get('/api/nba/:gameId', async (req, res) => {
    const api_url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${req.params.gameId}.json`;
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();
    } catch (err) {
        return res.json({ status: 'error', error: err, data: null });
    }

    return res.json({ status: 'ok', data: json.game });
});

// NBA get scoreboard by date
const templateHeaders = () => ({ ...template.headers })
app.get('/api/nba/date/:date', async (req, res) => {
    const date = `${req.params.date.slice(4)}-${req.params.date.slice(0, 2)}-${req.params.date.slice(2, 4)}`;
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
            return res.json({ status: 'error', error: 'No games scheduled', data: { games: [] } });
        }
    } catch (err) {
        return res.json({ status: 'error', error: err, data: { games: [] } });
    }

    return res.json({ status: 'ok', data: json.scoreboard });
});

// MLS get games by date
app.get('/api/mls/date/:date', async (req, res) => {
    // Get currDate in right format
    const currDate = `${req.params.date.slice(4)}-${req.params.date.slice(0, 2)}-${req.params.date.slice(2, 4)}`;

    // Check from currDate - nextDate
    const date = new Date(0).setFullYear(req.params.date.slice(4), req.params.date.slice(0, 2) - 1, req.params.date.slice(2, 4));
    let nDateObj = new Date(date);
    nDateObj.setDate(nDateObj.getDate() + 1);
    const nextDate = `${nDateObj.getFullYear()}-${("0" + (nDateObj.getMonth() + 1)).slice(-2)}-${("0" + nDateObj.getDate()).slice(-2)}`;

    const api_url = `https://sportapi.mlssoccer.com/api/matches?culture=en-us&dateFrom=${currDate}&dateTo=${nextDate}&competition=98&matchType=Regular&excludeSecondaryTeams=true`;
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();

        // Check game data
        if (!json.length) {
            return res.json({ status: 'error', error: 'No games scheduled', data: [] });
        }
    } catch (err) {
        return res.json({ status: 'error', error: err, data: [] });
    }

    return res.json({ status: 'ok', data: json });
});

// MLS get scoreboard
app.get('/api/mls/game/:gameId', async (req, res) => {
    const api_url = `https://stats-api.mlssoccer.com/v1/matches?&match_game_id=${req.params.gameId}&include=away_club_match&include=home_club_match&include=venue&include=home_club&include=away_club`;
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();

        // Check game data
        if (!json.length) {
            return res.json({ status: 'error', error: 'Score unavailable', data: [] });
        }
    } catch (err) {
        return res.json({ status: 'error', error: err, data: [] });
    }

    return res.json({ status: 'ok', data: json[0] });
});

// MLS get boxscore
app.get('/api/mls/game/:gameId/boxscore', async (req, res) => {
    const api_url = `https://stats-api.mlssoccer.com/v1/players/matches?&match_game_id=${req.params.gameId}&season_opta_id=2021&competition_opta_id=98&order_by=-player_match_stat_goals&include=match&include=statistics&include=club&include=player&order_by=player_last_name`;
    let json = null;
    try {
        const fetch_response = await fetch(api_url);
        json = await fetch_response.json();

        // Check game data
        if (!json.length) {
            return res.json({ status: 'error', error: 'Box score unavailable', data: [] });
        }
    } catch (err) {
        return res.json({ status: 'error', error: err, data: [] });
    }

    return res.json({ status: 'ok', data: json });
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
        });
    }
    if (!email || typeof email !== 'string') {
        return res.json({
            status: 'error',
            type: 'email',
            error: 'Invalid email'
        });
    }
    if (!pass || typeof pass !== 'string') {
        return res.json({
            status: 'error',
            type: 'password',
            error: 'Invalid password'
        });
    }
    if (pass.length < 6) {
        return res.json({
            status: 'error',
            type: 'password',
            error: 'Password too short. Should be at least 6 characters.'
        });
    }
    if (username.length < 4) {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Username too short. Should be at least 4 characters.'
        });
    }
    if (username.length > 20) {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Username too long. Should be no more than 20 characters.'
        });
    }

    // Hash password
    const password = await bcrypt.hash(pass, 10);

    // Attempt to create user in database
    try {
        const response = await User.create({
            username,
            email,
            password,
            admin: false
        });
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
        user = await User.findOne({ username: username }).lean();
    else if (!username)
        user = await User.findOne({ email: email }).lean();

    if (!user) {
        return res.json({ status: 'error', error: 'Invalid username/password' });
    }
    if (user && await bcrypt.compare(password, user.password)) {
        // Passwords match
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            admin: user.admin
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
                return res.json({ status: 'error', error: err.message, user: null });
            } else {
                const user = await User.findById(decodedToken.id);
                if (user) {
                    return res.json({ status: 'ok', user: user.username });
                } else {
                    return res.json({ status: 'error', error: 'Login not found', user: null });
                }
            }
        });
    } else {
        return res.json({ status: 'error', error: 'Not logged in', user: null });
    }
});

// Post a comment
app.post('/api/comments/post', requireAuth, async (req, res) => {
    let { content, type, gameId, parentId } = req.body;
    let parentUser = 'none';
    const date = new Date();
    const username = res.locals.token.username;

    // Remove leading spaces/newlines
    content = content.trim();

    // Error checking
    if (!username || typeof username !== 'string') {
        return res.json({
            status: 'error',
            type: 'username',
            error: 'Invalid username'
        });
    }
    if (!content) {
        return res.json({
            status: 'error',
            type: 'content',
            error: 'Comment cannot be empty'
        });
    } else if (typeof content !== 'string') {
        return res.json({
            status: 'error',
            type: 'content',
            error: 'Invalid content'
        });
    }
    if (content.length > COMMENT_MAXLEN) {
        return res.json({
            status: 'error',
            type: 'content',
            error: `Number of characters exceeds maximum (${content.length}/${COMMENT_MAXLEN})`
        });
    }
    if (parentId !== 'root') {
        try {
            const parent = await Comment.find({ _id: parentId });
            parentUser = parent[0].username;
        } catch (err) {
            console.log(err);
            return res.json({ status: 'error', error: 'Invalid parent' });
        }
    }

    // Create comment
    try {
        const response = await Comment.create({
            username,
            content,
            type,
            gameId,
            parentId,
            parentUser,
            date
        });
        return res.json({ status: 'ok', data: response });
    } catch (err) {
        return res.json({ status: 'error', error: 'Invalid content' });
    }
});

// Retrieve comments
app.get('/api/comments/get/:type/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    const type = req.params.type;

    const comments = await Comment.find({ type: type, gameId: gameId });
    if (comments.length > 0) {
        // Return all comments
        return res.json({ status: 'ok', comments: comments });
    } else {
        // Return nothing
        return res.json({ status: 'error', error: 'No comments', comments: null });
    }
});

// Delete comments
app.get('/api/comments/:_id/delete', requireAuth, async (req, res) => {
    const _id = req.params._id;

    // Ensure user is an admin, or is the user that posted
    const comment = await Comment.find({ _id: _id });
    if (comment.length && (res.locals.token.username !== comment[0].username) && !res.locals.token.admin) {
        return res.json({ status: 'error', error: 'You cannot delete other users\' comments' });
    } else if (!comment.length) {
        return res.json({ status: 'error', error: 'Comment does not exist' });
    }

    // Delete the comment
    try {
        await Comment.deleteOne({ _id: _id });
        return res.json({ status: 'ok' });
    } catch (err) {
        return res.json({ status: 'error', error: err })
    }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
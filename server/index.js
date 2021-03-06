const express = require("express");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const sdv = require('sportsdataverse');
const cheerio = require('cheerio');
const bbstats = require('bbref-player-stats');
require('dotenv').config();

// Models
const User = require('./model/user');
const Comment = require('./model/comment');
const Counter = require('./model/counter');

// Functions
const { requireAuth } = require('./middleware/authMiddleware');
const getAllReplies = async (parentId) => {
    let replies = await Comment.find({ parentId: parentId });
    if (replies.length) {
        const length = replies.length;
        for (let i = 0; i < length; i += 1) {
            const moreReplies = await getAllReplies(replies[i].commentId);
            if (moreReplies)
                replies = replies.concat(moreReplies);
        }
        return replies;
    } else {
        return null;
    }
}
const getParent = async (commentId) => {
    const comment = await Comment.find({ commentId: commentId });
    if (comment[0] && comment[0].parentId !== 0) {
        const result = await getParent(comment[0].parentId);
        if (result) {
            return result;
        } else {
            return comment[0].parentId;
        }
    } else {
        return 0;
    }
}

// Constants
const COMMENT_MAXLEN = 500;
const MLS_STAT_INDECES = ['id', 'name', 'position', 'team', 'age', 'year', 'matches_played', 'matches_started', 'minutes_played', 'full_minutes', 'goals', 'assists', 'non_penalty_goals', 'pens_made', 'pens_attempted', 'yellows', 'reds'];
const MLSTeams = ['ATL', 'ATX', 'CHI', 'CIN', 'CLB', 'CLT', 'COL', 'DAL', 'DC', 'HOU', 'LA', 'LAFC', 'MIA', 'MIN', 'MTL', 'NE', 'NSH', 'NYC', 'ORL', 'PHI', 'POR', 'RBNY', 'RSL', 'SEA', 'SJ', 'SKC', 'STL', 'TOR', 'VAN'];
const NBATeams = ['1610612737', '1610612738', '1610612739', '1610612740', '1610612741', '1610612742', '1610612743', '1610612744', '1610612745', '1610612746', '1610612747', '1610612748', '1610612749', '1610612750', '1610612751', '1610612752', '1610612753', '1610612754', '1610612755', '1610612756', '1610612757', '1610612758', '1610612759', '1610612760', '1610612761', '1610612762', '1610612763', '1610612764', '1610612765', '1610612766'];
const PORT = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect(`mongodb+srv://${process.env.MDB_USER}:${process.env.MDB_PASS}@areto-db.f2kke.mongodb.net/areto-main?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("Connected to MongoDB")).catch(err => console.error(`Error connecting to MongoDB: ${err}`));

// Express setup
const app = express();
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.resolve(__dirname, '../client/build')));

/*
 *  NBA API
 */

// NBA get boxscore
app.get('/api/nba/boxscore/:id', async (req, res) => {
    try {
        const result = await sdv.nba.getBoxScore(req.params.id);
        if (result.players)
            return res.json({ status: 'ok', data: result });
        else
            return res.json({ status: 'error', error: 'Box score unavailable', data: null });
    } catch (err) {
        return res.json({ status: 'error', error: err, data: null });
    }
});

// NBA get scoreboard by date
app.get('/api/nba/date/:date', async (req, res) => {
    const year = req.params.date.slice(4), month = req.params.date.slice(0, 2), day = req.params.date.slice(2, 4);

    const inputs = {
        year: parseInt(year), month: parseInt(month), day: parseInt(day)
    };
    try {
        const result = await sdv.nba.getScoreboard(inputs);
        if (result.events.length === 0) {
            // No games scheduled
            return res.json({ status: 'error', error: 'No games scheduled', data: { games: [] } });
        } else {
            return res.json({ 
                status: 'ok', 
                data: { 
                    games: result.events.map((game) => {
                        return game.competitions[0];
                    })
                }
            });
        }
    } catch (err) {
        return res.json({ status: 'error', error: err, data: { games: [] } });
    }    
});

// NBA get standings
app.get('/api/nba/standings', async (req, res) => {
    try {
        const baseUrl = `https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings`;
        const result = await fetch(baseUrl);
        const json = await result.json();

        return res.json({ status: 'ok', data: json.children });
    } catch (err) {
        return res.json({ status: 'error', error: err });
    }
});

// NBA get all player stats
app.get('/api/nba/players/all/:season', async (req, res) => {
    const { season } = req.params;

    try {
        const data = await bbstats.getAllPlayers(season);
        return res.json({ status: 'ok', data: data });
    } catch (err) {
        return res.json({ status: 'error', error: err })
    }
});

/*
 *  MLS API
 */

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
    let json = null;
    try {
        const fetch_response = await fetch(`https://stats-api.mlssoccer.com/v1/players/matches?&match_game_id=${req.params.gameId}&season_opta_id=2021&competition_opta_id=98&order_by=-player_match_stat_goals&include=match&include=statistics&include=club&include=player&order_by=player_last_name`);
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

// MLS get standings
app.get('/api/mls/standings', async (req, res) => {
    try {
        const fetch_response = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/usa.1/standings');
        const json = await fetch_response.json();
        return res.json({ status: 'ok', data: json.children });
    } catch (err) {
        return res.json({ status: 'error', error: err });
    }
});

// MLS get all player stats (current season)
app.get('/api/mls/players/all', async (req, res) => {
    const $ = await fetch('https://fbref.com/en/comps/22/stats/Major-League-Soccer-Stats')
        .then(async (result) => {
            let data = await result.text();
            // Remove comments
            data = data.replace(/<!--/g, '');
            data = data.replace(/-->/g, '');
            return cheerio.load(data);
        });
    
    // Form list with table data
    const playerList = [];
    $('table[id=stats_standard]').find('tbody > tr').each((i, rows) => {
        let player = {};
        $(rows).find('td').each((j, data) => {
            if (!j) {
                // Get player id
                const link = $(data).find('a').attr('href');
                let result = link.match(/\/en\/players\/.+\//);
                result = result[0].substring(12);
                result = result.substring(0, result.length - 1);

                // Push id and name
                player[MLS_STAT_INDECES[j]] = result;
                player[MLS_STAT_INDECES[j + 1]] = $(data).text()
            } else if (j < 17 && j > 1) {
                // Push totals
                player[MLS_STAT_INDECES[j]] = $(data).text();
            }
        });
        if (Object.keys(player).length)
            playerList.push(player);
    })

    // Remove duplicates
    const alreadySeen = [];
    for (let i = 0; i < playerList.length; i += 1) {
        if (alreadySeen[playerList[i].name]) {
            // Index of first player seen
            const ind = alreadySeen[playerList[i].name] - 1;

            // Add stats if duplicate
            for (let j = 6; j < Object.keys(playerList[i]).length; j += 1) {
                if (j === 9) {
                    playerList[ind][MLS_STAT_INDECES[j]] = (parseFloat(playerList[ind][MLS_STAT_INDECES[j]]) + parseFloat(playerList[i][MLS_STAT_INDECES[j]])).toFixed(1).toString();
                } else {
                    playerList[ind][MLS_STAT_INDECES[j]] = (parseInt(playerList[ind][MLS_STAT_INDECES[j]]) + parseInt(playerList[i][MLS_STAT_INDECES[j]])).toString();
                }
            }

            // Remove last
            playerList.splice(i, 1);
            i -= 1;
        }
        else {
            alreadySeen[playerList[i].name] = i + 1;
        }
    }

    return res.json({ status: 'ok', data: playerList })
});

/*
 *  Areto account API
 */

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

    // Check for special characters in username
    if (username.match(/^[a-zA-Z0-9_.-]*$/) === null) {
        return res.json({ 
            status: 'error',
            type: 'username',
            error: 'Username cannot contain special characters'
        });
    }

    // Hash password
    const password = await bcrypt.hash(pass, 10);

    // Attempt to create user in database
    try {
        await User.create({
            username,
            email,
            password,
            admin: false,
            favNBA: 'none',
            favMLS: 'none'
        });
        
        // Log user in after success
        let user = await User.findOne({ username: username }).lean();
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            admin: user.admin
        }, process.env.JWT_SECRET, {
            expiresIn: '3d'
        });
        const maxAge = 3 * 24 * 60 * 60; // 3 days (in seconds)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        return res.json({ status: 'ok', data: token, user: {
            username: user.username,
            admin: user.admin
        }});
    } catch (err) {
        if (err.errors) {
            // Validation error
            if (err.errors.username) {
                return res.json({
                    status: 'error',
                    type: 'username',
                    error: err.errors.username.message
                });
            } else if (err.errors.email) {
                return res.json({
                    status: 'error',
                    type: 'email',
                    error: err.errors.email.message
                });
            }
        }
        return res.json({ status: 'error', error: JSON.stringify(err) });
    }
});

// Log in to account
app.post('/api/login', async (req, res) => {
    const { username, email, password } = req.body;
    let user = null;

    if (!username && !email) {
        return res.json({ status: 'error', error: 'Invalid username/password' });
    }

    if (!email) {
        // Find user with username
        const regexUsername = username.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        user = await User.findOne({ username: {
            $regex : new RegExp(`^${regexUsername}$`, "i") } }
        ).lean();
    }
    else if (!username) {
        // Find user with email
        const regexEmail = email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        user = await User.findOne({ email: {
            $regex : new RegExp(`^${regexEmail}$`, "i") } }
        ).lean();
    }

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
        return res.json({ status: 'ok', data: token, user: {
            username: user.username,
            admin: user.admin,
            favMLS: user.favMLS,
            favNBA: user.favNBA,
        }});
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
app.get('/api/me', requireAuth, async (req, res) => {
    // Return user info if available
    const user = await User.findById(res.locals.token.id);
    if (user) {
        return res.json({ status: 'ok', user: {
            username: user.username,
            admin: user.admin,
            favNBA: user.favNBA,
            favMLS: user.favMLS
        } });
    } else {
        return res.json({ status: 'error', error: 'Login not found', user: null });
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
    if (parentId !== 0) {
        try {
            const parent = await Comment.find({ commentId: parentId });
            parentUser = parent[0].username;
        } catch (err) {
            return res.json({ status: 'error', error: 'Parent comment does not exist' });
        }
    }

    // Create comment
    try {
        const counter = await Counter.find({ usage: 'comments' });
        const response = await Comment.create({
            commentId: counter[0].count,
            username,
            content,
            type,
            gameId,
            parentId,
            parentUser,
            date
        });

        // Update counter on success
        await Counter.updateOne({ usage: 'comments' }, { count: counter[0].count + 1 });

        return res.json({ status: 'ok', data: response });
    } catch (err) {
        console.error(err);
        return res.json({ status: 'error', error: 'Invalid content' });
    }
});

// Retrieve comments
app.get('/api/comments/get/:type/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    const type = req.params.type;

    const comments = await Comment.find({ type: type, gameId: gameId });

    // Return flairs
    let commentInfo = [];
    for(let i = 0; i < comments.length; i += 1) {
        const user = await User.find({ username: comments[i].username }).lean();
        if (user.length) {
            commentInfo.push({
                comment: comments[i],
                userInfo: {
                    username: user[0].username,
                    favMLS: user[0].favMLS,
                    favNBA: user[0].favNBA
                }
            });
        } else {
            commentInfo.push({
                comment: comments[i],
                userInfo: {
                    username: '[deleted]',
                    favMLS: 'none',
                    favNBA: 'none'
                }
            });
        }
    }

    if (comments.length > 0) {
        // Return all comments
        return res.json({ status: 'ok', comments: commentInfo });
    } else {
        // Return nothing
        return res.json({ status: 'error', error: 'No comments', comments: null });
    }
});

// Retrieve comments and replies from commentId
app.get('/api/comments/d/get/:commentId', async (req, res) => {
    const commentId = req.params.commentId;

    // Id 0 reserved for root
    if (commentId === 0) {
        return res.json({ status: 'error', error: 'No comments', comments: null })
    }

    // Get parent comment
    const comments = await Comment.find({ commentId: commentId });
    const replies = await getAllReplies(commentId);

    // Concat parent comment and replies
    if (replies) {
        replies.forEach((reply) => {
            comments.push(reply);
        });
    }

    // Return flairs
    let commentInfo = [];
    for (let i = 0; i < comments.length; i += 1) {
        const user = await User.find({ username: comments[i].username }).lean();
        if (user.length) {
             commentInfo.push({
                comment: comments[i],
                userInfo: {
                    username: user[0].username,
                    favMLS: user[0].favMLS,
                    favNBA: user[0].favNBA
                }
            });
        } else {
            commentInfo.push({
                comment: comments[i],
                userInfo: {
                    username: '[deleted]',
                    favMLS: 'none',
                    favNBA: 'none'
                }
            });
        }
    };

    if (commentInfo.length > 0) {
        return res.json({ status: 'ok', comments: commentInfo });
    } else {
        return res.json({ status: 'error', error: 'No comments', comments: null });
    }
});

// Retrieve original parentId from a reply's commentId
app.get('/api/comments/d/parent/:commentId', async (req, res) => {
    const commentId = req.params.commentId;

    // Id 0 reserved for root
    if (commentId === 0) {
        return res.json({ status: 'error', error: 'No comments', comments: null })
    }

    // Get parent comment
    const parentId = await getParent(commentId);

    return res.json({ status: 'ok', data: parentId });
});

// Delete comments
app.get('/api/comments/:commentId/delete', requireAuth, async (req, res) => {
    const commentId = req.params.commentId;

    // Ensure user is an admin, or is the user that posted
    const comment = await Comment.find({ commentId: commentId });
    if (comment.length && (res.locals.token.username !== comment[0].username) && !res.locals.token.admin) {
        return res.json({ status: 'error', error: 'You cannot delete other users\' comments' });
    } else if (!comment.length) {
        return res.json({ status: 'error', error: 'Comment does not exist' });
    }

    // Find any replies to that comment
    const replies = await Comment.find({ parentId: commentId });
    if (replies.length === 0) {
        // No replies, delete the comment
        try {
            await Comment.deleteOne({ commentId: commentId });
            return res.json({ status: 'ok', data: 'deleted' });
        } catch (err) {
            return res.json({ status: 'error', error: err })
        }
    } else {
        try {
            // Otherwise, change content and username to [deleted]
            await Comment.updateOne({ commentId: commentId }, { content: '[Deleted by user]', username: '[deleted]', parentUser: '[deleted]' });

            // Set all replies' parentUser to [deleted]
            await Comment.updateMany({ parentId: commentId }, { parentUser: '[deleted]' });

            return res.json({ status: 'ok', data: 'modified' });
        } catch (err) {
            return res.json({ status: 'error', error: err });
        }
    }
});

// Edit comments
app.post('/api/comments/edit', requireAuth, async (req, res) => {
    let { content, commentId } = req.body;

    // Ensure user is the user that posted
    let comment = await Comment.find({ commentId: commentId });
    if (comment.length && (res.locals.token.username !== comment[0].username)) {
        return res.json({ status: 'error', error: 'You cannot edit other users\' comments' });
    } else if (!comment.length) {
        return res.json({ status: 'error', error: 'Comment does not exist' });
    }

    try {
        // If user updates within 5 minutes, the edit won't be recorded
        const now = new Date();
        const creation = new Date(comment[0].date);
        if (((Math.abs(now - creation)/1000)/60) < 5 ) {
            await Comment.updateOne({ commentId: commentId }, { content: content });
        } else {
            await Comment.updateOne({ commentId: commentId }, { content: content, edited: true, editDate: new Date() });
        }

        // Retrieve comment again and return
        comment = await Comment.find({ commentId: commentId });
        return res.json({ status: 'ok', comment: comment });
    } catch (err) {
        return res.json({ status: 'error', error: err });
    }
});

// Get user info
app.get('/api/user/:userId', async (req, res) => {
    // Escape all special characters
    const regexUserId = req.params.userId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // Find the user
    const user = await User.findOne({ username: {
        $regex : new RegExp(`^${regexUserId}$`, "i") } }
    ).lean();

    // Check if user was found
    if (!user)
        return res.json({ status: 'error', error: 'User not found' });
    const userInfo = {
        username: user.username,
        favMLS: user.favMLS,
        favNBA: user.favNBA
    };

    const comments = await Comment.find({ username: {
        $regex : new RegExp(`^${regexUserId}$`, "i") } }
    );
    if (comments.length > 0) {
        // Return all comments
        return res.json({ status: 'ok', user: userInfo, comments: comments });
    } else {
        // Return null if no comments found
        return res.json({ status: 'ok', user: userInfo, comments: null });
    }
});

// Set favorite teams
app.post('/api/user/:userId/set-teams', requireAuth, async (req, res) => {
    let { mlsId, nbaId } = req.body;

    // Check for mismatched usernames
    if (res.locals.token.username !== req.params.userId)
        return res.json({ status: 'error', error: 'You cannot change other users\' settings' });

    // Error checking
    if (mlsId !== 'none' && !MLSTeams.includes(mlsId))
        return res.json({ status: 'error', error: 'Invalid MLS team id' });
    else if (nbaId !== 'none' && !NBATeams.includes(nbaId))
        return res.json({ status: 'error', error: 'Invalid NBA team id' });

    // Update favorite teams
    try {
        await User.updateOne({ username: res.locals.token.username }, { favMLS: mlsId, favNBA: nbaId });
        return res.json({ status: 'ok' });
    } catch (err) {
        return res.json({ status: 'error', error: err });
    }
});

// All other GET requests not handled before will return the app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/', 'index.html'));
});
const jwt = require('jsonwebtoken');
const User = require('../model/user');

const requireAuth = (req, res, next) => {
    let cookies = req.headers.cookie;

    if (cookies) {
        // Extract jwt token from cookies
        let token = null;
        const value = `; ${cookies}`;
        const parts = value.split('; jwt=');
        if (parts.length === 2)
            token = parts.pop().split(';').shift();
        else
            return res.json({ status: 'error', error: 'You must be logged in to do that'});

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.json({ status: 'error', error: err.message});
            } else {
                // Set token and call next function
                res.locals.token = decodedToken;
                next();
            }
        });
    } else {
        return res.json({ status: 'error', error: 'You must be logged in to do that'});
    }
}

module.exports = { requireAuth };
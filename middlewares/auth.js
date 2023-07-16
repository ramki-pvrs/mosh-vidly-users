
//middleware function with next
//next connects to next middleware

const config = require('config');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('No Token provided');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey')); //comes from env var
        req.user = decoded; //decoed is the payload user object really
        next(); //next is router handler
    } catch (ex) {
        res.status(400).send('Invalid token');
    }
}

module.exports = auth;
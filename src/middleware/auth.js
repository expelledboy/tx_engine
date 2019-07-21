const authenticate = require('basic-auth');
const config = require('../config.js');

// user credentials from config
const {
  username,
  password,
} = config.api.auth;

const auth = (req, res, next) => {
  // compare with 'Authenticate' header and continue on match
  const user = authenticate(req);
  if (
    user.name == username &&
    user.pass == password
  ) return next();

  // else reject http request
  res.status(401);
  res.setHeader('WWW-Authenticate', 'Basic realm="system"')
  res.end('Access denied');
}

module.exports = auth;

const { checkNull } = require('../utils/globalFunction');
const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');
const { CLIENT_ID, CLIENT_ID_EMI } = process.env;

function auth (req, res, next) {
  const token = checkNull(req.header('Eurokars-Auth-Token'));

  if (token === '-') {
    throw new AuthenticationError('Token is Empty');
  } else {
    try {
      const decoded = jwt.decode(token);

      const { appid } = decoded;

      if (appid !== CLIENT_ID && appid !== CLIENT_ID_EMI) throw new AuthenticationError('Token is Invalid');

      req.user = decoded;
      next();
    } catch (ex) {
      if (ex instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token is Expired');
      } else {
        throw new AuthenticationError('Token is Invalid');
      }
    }
  }
}

module.exports = auth;

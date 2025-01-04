const AuthorizationError = require('../exceptions/AuthorizationError');

function allowedMethods (req, res, next) {
  const arrayAllowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  const method = req.method;

  if (arrayAllowedMethods.includes(method)) {
    next();
  } else {
    throw new AuthorizationError('Request Method no Allowed');
  }
}

module.exports = allowedMethods;

const AuthorizationError = require('../exceptions/AuthorizationError');

function proxy (req, res, next) {
  const validApiGatewayIP = ['::ffff:127.0.0.1', '::1'];
  const remoteAddress = req.connection.remoteAddress;

  if (validApiGatewayIP.includes(remoteAddress)) {
    next();
  } else {
    throw new AuthorizationError('Please HIT with API Gateway');
  }
}

module.exports = proxy;

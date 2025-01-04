const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');

const { URL, JWT_PRIVATE_KEY, JWT_REFRESH_TOKEN } = process.env;

const TokenManager = {
  generateAccessToken: (uuid, payload) => {
    const options = {
      expiresIn: '15m',
      issuer: URL,
      subject: uuid
    };

    return jwt.sign({ data: payload }, JWT_PRIVATE_KEY, options);
  },
  generateRefreshToken: (uuid, payload) => {
    const options = {
      issuer: URL,
      subject: uuid
    };

    return jwt.sign({ data: payload }, JWT_REFRESH_TOKEN, options);
  },
  verifyRefreshToken: (refreshToken) => {
    try {
      const user = jwt.verify(refreshToken, JWT_REFRESH_TOKEN);
      return user;
    } catch (error) {
      throw new AuthenticationError('Refresh Token not Valid');
    }
  },
  getuserId: (accessToken) => {
    try {
      const user = jwt.decode(accessToken);
      return user;
    } catch (error) {
      throw new AuthenticationError('Access Token not Valid');
    }
  },
  generateAccessTokenDevice: (uuid, payload) => {
    const options = {
      issuer: URL,
      subject: uuid
    };

    return jwt.sign({ data: payload }, JWT_PRIVATE_KEY, options);
  }
};

module.exports = TokenManager;

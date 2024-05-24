const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');
const tokenManager = require('../../utils/tokenManager');

// Repositories
const userRepository = require('../../repositories/mysql/userRepository');

const refreshTokenRepository = require('../../repositories/mysql/refreshTokenRepository');

// Validator
const { loginValidator, registerValidator } = require('../../validators/authenticationValidator');

// Azure
const msal = require('@azure/msal-node');

// helper
const { objectToQueryString } = require('../../utils/globalFunction');

const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: process.env.AUTHORITY,
    clientSecret: process.env.CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback (loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose
    }
  }
};

const cca = new msal.ConfidentialClientApplication(config);

router.post('/register', async (req, res) => {
  registerValidator(req.body);

  const { username, password, email } = req.body;

  const user = await userRepository.register(username, password, email);

  const data = {
    username: user.username,
    level: user.level
  };

  const accessToken = tokenManager.generateAccessToken(user.uuid, data);
  const refreshToken = tokenManager.generateRefreshToken(user.uuid, data);

  await refreshTokenRepository.addRefreshToken(refreshToken);

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Registered',
    data: {
      user: user.username,
      level: user.level,
      created_at: user.created_at
    }
  });
});

router.post('/login', async (req, res) => {
  loginValidator(req.body);

  const { username, password } = req.body;

  const user = await userRepository.login(username, password);

  const data = {
    username: user.username,
    level: user.level
  };

  const accessToken = tokenManager.generateAccessToken(user.uuid, data);
  const refreshToken = tokenManager.generateRefreshToken(user.uuid, data);

  await refreshTokenRepository.addRefreshToken(refreshToken);

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Logged In',
    data
  });
});

router.put('/refresh-token', async (req, res) => {
  const refreshToken = req.header('Eurokars-Auth-Refresh-Token');

  await refreshTokenRepository.getRefreshToken(refreshToken);

  const decoded = tokenManager.verifyRefreshToken(refreshToken);

  const { data, sub } = decoded;

  const payload = {
    username: data.username,
    level: data.level
  };

  const accessToken = tokenManager.generateAccessToken(sub, payload);

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Refresh Token',
    data: data.username
  });
});

router.delete('/logout', async (req, res) => {
  // const refreshToken = req.header('Eurokars-Auth-Refresh-Token');

  // await refreshTokenRepository.getRefreshToken(refreshToken);
  // await refreshTokenRepository.deleteRefreshToken(refreshToken);

  // res.header('Eurokars-Auth-Token', '');
  // res.header('Eurokars-Auth-Refresh-Token', '');
  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Logged Out',
    data: null
  });
});

router.get('/login/sso/', async (req, res) => {
  const tokenRequest = {
    scopes: ['User.Read'],
    redirectUri: 'http://localhost:3001/v1/auth/sso/redirect'
  };

  try {
    const redirect = await cca.getAuthCodeUrl(tokenRequest);

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Successfully Get Login URL',
      data: redirect
    });
    // res.redirect(redirect);
  } catch (error) {
    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Failed Get Login URL',
      data: null
    });
  }
});

router.get('/sso/redirect', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    redirectUri: 'http://localhost:3001/v1/auth/sso/redirect',
    scopes: ['User.Read']
  };

  cca.acquireTokenByCode(tokenRequest).then((response) => {
    console.log(response);

    const { account, idTokenClaims, idToken, accessToken, expiresOn } = response;

    const data = {
      username: account.username,
      name: account.name,
      ip_address: idTokenClaims.ipaddr,
      id_token: idToken,
      access_token: accessToken,
      expires_on: expiresOn
    };

    const queryString = objectToQueryString(data);

    res.redirect('http://localhost:3004/redirect?data=' + btoa(queryString));
  }).catch((error) => {
    console.log(error);
    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Failed Logged In',
      data: null
    });
  });
});

router.post('/login/sso', async (req, res) => {
  loginValidator(req.body);

  const { username, password } = req.body;

  const tokenRequest = {
    scopes: ['User.Read'],
    username,
    password
  };

  try {
    const data = await cca.acquireTokenByUsernamePassword(tokenRequest);

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Successfully Logged In',
      data
    });
  } catch (error) {
    res.status(httpStatus.NOT_FOUND).json({
      code: httpStatus.NOT_FOUND,
      success: true,
      message: 'Failed Logged In',
      data: error
    });
  }
});

router.put('/refresh-token/sso', async (req, res) => {
  const refreshToken = req.header('Eurokars-Auth-Token');

  console.log(refreshToken);

  const tokenRequest = {
    scopes: ['User.Read'],
    refreshToken
  };

  try {
    const data = await cca.acquireTokenSilent(tokenRequest);

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Successfully Refresh Token',
      data
    });
  } catch (error) {
    res.status(httpStatus.NOT_FOUND).json({
      code: httpStatus.NOT_FOUND,
      success: true,
      message: 'Failed Refresh Token',
      data: error
    });
  }
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const tokenManager = require('../../utils/tokenManager');

// Repositories
const userRepository = require('../../repositories/mysql/userRepository');

const refreshTokenRepository = require('../../repositories/mysql/refreshTokenRepository');

// Azure
const msal = require('@azure/msal-node');

const { CLIENT_ID, REDIRECT_URI, AUTHORITY, CLIENT_SECRET } = process.env;

const config = {
  auth: {
    clientId: CLIENT_ID,
    authority: AUTHORITY,
    clientSecret: CLIENT_SECRET
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

router.put('/refresh-token', async (req, res) => {
  const refreshToken = req.header('Eurokars-Auth-Refresh-Token');

  await refreshTokenRepository.getRefreshToken(refreshToken);

  const decoded = tokenManager.verifyRefreshToken(refreshToken);

  const {
    data,
    sub
  } = decoded;

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

router.get('/login/sso/', async (req, res) => {
  const tokenRequest = {
    scopes: ['User.Read'],
    redirectUri: REDIRECT_URI
  };

  try {
    const redirect = await cca.getAuthCodeUrl(tokenRequest);

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Successfully Get Login URL',
      data: redirect
    });
  } catch (error) {
    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: false,
      message: 'Failed Get Login URL',
      data: null
    });
  }
});

router.get('/sso/token', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    redirectUri: REDIRECT_URI,
    scopes: ['User.Read']
  };

  cca.acquireTokenByCode(tokenRequest).then(async (response) => {
    const {
      account,
      idTokenClaims,
      idToken,
      accessToken,
      expiresOn
    } = response;

    const decodedToken = jwt.decode(accessToken);

    const {
      oid: uniqueId,
      given_name: givenName,
      family_name: surname,
      name: displayName,
      unique_name: mail,
      ipaddr: ipAddr
    } = decodedToken;

    await userRepository.registerSSO({
      uniqueId,
      mail,
      givenName,
      surname,
      displayName,
      ipAddr
    });

    const data = {
      username: account.username,
      name: account.name,
      ip_address: idTokenClaims.ipaddr,
      id_token: idToken,
      access_token: accessToken,
      expires_on: expiresOn
    };

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Success Logged In',
      data
    });
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

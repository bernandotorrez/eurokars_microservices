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

const {
  CLIENT_ID,
  REDIRECT_URI,
  AUTHORITY,
  CLIENT_SECRET,
  CLIENT_ID_EMI,
  REDIRECT_URI_EMI,
  AUTHORITY_EMI,
  CLIENT_SECRET_EMI,
  POST_LOGOUT_REDIRECT_URI
} = process.env;

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

const configEMI = {
  auth: {
    clientId: CLIENT_ID_EMI,
    authority: AUTHORITY_EMI,
    clientSecret: CLIENT_SECRET_EMI
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

const ccaEMI = new msal.ConfidentialClientApplication(configEMI);

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
    scopes: ['openid', 'profile', 'offline_access', 'user.read'],
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

router.get('/login/sso/emi', async (req, res) => {
  const tokenRequest = {
    scopes: ['openid', 'profile', 'offline_access', 'user.read'],
    redirectUri: REDIRECT_URI_EMI
  };

  try {
    const redirect = await ccaEMI.getAuthCodeUrl(tokenRequest);

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
    scopes: ['openid', 'profile', 'offline_access', 'user.read']
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

    const logoutUri = `${AUTHORITY}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    const data = {
      username: account.username,
      name: account.name,
      ip_address: idTokenClaims.ipaddr,
      id_token: idToken,
      access_token: accessToken,
      expires_on: expiresOn,
      logout_uri: logoutUri
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

router.get('/sso/token/emi', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    redirectUri: REDIRECT_URI_EMI,
    scopes: ['openid', 'profile', 'offline_access', 'user.read']
  };

  ccaEMI.acquireTokenByCode(tokenRequest).then(async (response) => {
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

    const logoutUri = `${AUTHORITY_EMI}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    const data = {
      username: account.username,
      name: account.name,
      ip_address: idTokenClaims.ipaddr,
      id_token: idToken,
      access_token: accessToken,
      expires_on: expiresOn,
      logout_uri: logoutUri
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

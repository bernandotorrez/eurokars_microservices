const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const tokenManager = require('../../utils/tokenManager');
const { generatePkcePair } = require('../../utils/globalFunction');

// Repositories
const userRepository = require('../../repositories/mysql/userRepository');

const refreshTokenRepository = require('../../repositories/mysql/refreshTokenRepository');

const {
  CLIENT_ID,
  REDIRECT_URI,
  AUTHORITY,
  CLIENT_SECRET,
  CLIENT_ID_EMI,
  REDIRECT_URI_EMI,
  AUTHORITY_EMI,
  CLIENT_SECRET_EMI,
  POST_LOGOUT_REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI_EMI
} = process.env;

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
  const { verifier, challenge } = generatePkcePair();

  try {
    const redirect = `${AUTHORITY}/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=https://graph.microsoft.com/.default%20openid%20offline_access&code_challenge=${challenge}&code_challenge_method=S256`;
    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Successfully Get Login URL',
      data: {
        redirect,
        verifier
      }
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
  const { verifier, challenge } = generatePkcePair();

  try {
    const redirect = `${AUTHORITY_EMI}/oauth2/v2.0/authorize?client_id=${CLIENT_ID_EMI}&response_type=code&redirect_uri=${REDIRECT_URI_EMI}&scope=https://graph.microsoft.com/.default%20openid%20offline_access&code_challenge=${challenge}&code_challenge_method=S256`;
    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      success: true,
      message: 'Successfully Get Login URL',
      data: {
        redirect,
        verifier
      }
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
  const {
    code_verifier: codeVerifier,
    code,
    browser,
    os,
    device,
    type
  } = req.query;

  const tokenRequest = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code_verifier: codeVerifier,
    scope: 'openid offline_access'
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  axios.post(`${AUTHORITY}/oauth2/v2.0/token`,
    new URLSearchParams(tokenRequest).toString(),
    { headers }
  )
    .then(async response => {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: idToken
      } = response.data;

      const decodedToken = jwt.decode(accessToken);

      const logoutUri = `${AUTHORITY}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

      const {
        oid: uniqueId,
        given_name: givenName,
        family_name: surname,
        name: displayName,
        unique_name: mail,
        ipaddr: ipAddr,
        name
      } = decodedToken;

      axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: accessToken }
      }).then(async responseProfile => {
        const { jobTitle } = responseProfile.data;

        // Generate Token for User Session
        const unixTimeSeconds = Math.floor(Date.now() / 1000);

        const dataToken = {
          browser,
          os,
          device,
          type,
          time: unixTimeSeconds
        };

        const accessTokenDevice = tokenManager.generateAccessTokenDevice(uniqueId, dataToken);

        await userRepository.registerSSO({
          uniqueId,
          mail,
          givenName,
          surname,
          displayName,
          ipAddr,
          logoutUri,
          jobTitle,
          browser,
          os,
          device,
          type,
          token: accessTokenDevice
        });

        const data = {
          username: givenName,
          name,
          ip_address: ipAddr,
          id_token: idToken,
          access_token: accessToken,
          refresh_token: refreshToken,
          logout_uri: logoutUri,
          access_token_device: accessTokenDevice
        };

        res.status(httpStatus.OK).json({
          code: httpStatus.OK,
          success: true,
          message: 'Success Logged In',
          data
        });
      });
    })
    .catch(error => {
      res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        success: false,
        message: 'Failed Logged In',
        data: error
      });
    });
});

router.get('/sso/token/emi', (req, res) => {
  const {
    code_verifier: codeVerifier,
    code,
    browser,
    os,
    device,
    type
  } = req.query;

  const tokenRequest = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI_EMI,
    client_id: CLIENT_ID_EMI,
    client_secret: CLIENT_SECRET_EMI,
    code_verifier: codeVerifier,
    scope: 'openid offline_access'
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  axios.post(`${AUTHORITY_EMI}/oauth2/v2.0/token`,
    new URLSearchParams(tokenRequest).toString(),
    { headers }
  )
    .then(async response => {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: idToken
      } = response.data;

      const decodedToken = jwt.decode(accessToken);

      const logoutUri = `${AUTHORITY_EMI}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI_EMI}`;

      const {
        oid: uniqueId,
        given_name: givenName,
        family_name: surname,
        name: displayName,
        unique_name: mail,
        ipaddr: ipAddr,
        name
      } = decodedToken;

      axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: accessToken }
      }).then(async responseProfile => {
        const { jobTitle } = responseProfile.data;

        // Generate Token for User Session
        const unixTimeSeconds = Math.floor(Date.now() / 1000);

        const dataToken = {
          browser,
          os,
          device,
          type,
          time: unixTimeSeconds
        };

        const accessTokenDevice = tokenManager.generateAccessTokenDevice(uniqueId, dataToken);

        await userRepository.registerSSO({
          uniqueId,
          mail,
          givenName,
          surname,
          displayName,
          ipAddr,
          logoutUri,
          jobTitle,
          browser,
          os,
          device,
          type,
          token: accessTokenDevice
        });

        const data = {
          username: givenName,
          name,
          ip_address: ipAddr,
          id_token: idToken,
          access_token: accessToken,
          refresh_token: refreshToken,
          logout_uri: logoutUri,
          access_token_device: accessTokenDevice
        };

        res.status(httpStatus.OK).json({
          code: httpStatus.OK,
          success: true,
          message: 'Success Logged In',
          data
        });
      });
    })
    .catch(error => {
      res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        success: false,
        message: 'Failed Logged In',
        data: error
      });
    });
});

router.put('/refresh-token/sso', async (req, res) => {
  const refreshToken = req.header('Eurokars-Auth-Refresh-Token');

  const tokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'openid offline_access'
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  axios.post(`${AUTHORITY}/oauth2/v2.0/token`,
    new URLSearchParams(tokenRequest).toString(),
    { headers }
  )
    .then(async response => {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: idToken
      } = response.data;

      const data = {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: idToken
      };

      res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        success: true,
        message: 'Success Refresh Token',
        data
      });
    })
    .catch(error => {
      res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        success: false,
        message: 'Failed Refresh Token',
        data: error
      });
    });
});

router.put('/refresh-token/sso/emi', async (req, res) => {
  const refreshToken = req.header('Eurokars-Auth-Refresh-Token');

  const tokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID_EMI,
    client_secret: CLIENT_SECRET_EMI,
    scope: 'openid offline_access'
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  axios.post(`${AUTHORITY_EMI}/oauth2/v2.0/token`,
    new URLSearchParams(tokenRequest).toString(),
    { headers }
  )
    .then(async response => {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: idToken
      } = response.data;

      const data = {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token: idToken
      };

      res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        success: true,
        message: 'Success Refresh Token',
        data
      });
    })
    .catch(error => {
      res.status(httpStatus.FORBIDDEN).json({
        code: httpStatus.FORBIDDEN,
        success: false,
        message: 'Failed Refresh Token',
        data: error
      });
    });
});

router.delete('/logout', async (req, res) => {
  const deviceToken = req.header('Eurokars-Device-Token');

  await userRepository.logout(deviceToken);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: false,
    message: 'Successfully Logged Out',
    data: null
  });
});

module.exports = router;

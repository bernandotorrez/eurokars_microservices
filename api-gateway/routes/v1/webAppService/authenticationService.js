const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../../utils/apiAdapter.js');
const { objectToQueryString } = require('../../../utils/globalFunction.js');
const { URL_WEBAPP_SERVICE } = process.env;
const api = apiAdapter(URL_WEBAPP_SERVICE);

const route = 'auth';

router.put('/refresh-token', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Refresh-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Refresh-Token': accessToken
    }
  };

  const user = await api.put(`/v1/${route}/refresh-token`, {}, headers);

  const accessTokenResponse = user.headers['eurokars-auth-token'];
  res.header('Eurokars-Auth-Token', accessTokenResponse);

  return res.json(user.data);
});

router.get('/login/sso', async (req, res) => {
  const user = await api.get(`/v1/${route}/login/sso`);

  return res.json(user.data);
});

router.get('/sso/redirect', async (req, res) => {
  const { code } = req.query;

  const user = await api.get(`/v1/${route}/sso/redirect?code=${code}`);

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

router.get('/sso/token', async (req, res) => {
  const { code, code_verifier, browser, os, device, type } = req.query;

  const queryString = {
    code,
    code_verifier,
    browser,
    os,
    device,
    type
  };

  const user = await api.get(`/v1/${route}/sso/token?${objectToQueryString(queryString)}`);

  const accessToken = user.data.data.access_token;
  const refreshToken = user.data.data.id_token;

  res.cookie('Eurokars-Auth-Token-Test', accessToken);
  res.cookie('Eurokars-Auth-Refresh-Token-Test', refreshToken);
  return res.json(user.data);
});

router.get('/login/sso/emi', async (req, res) => {
  const user = await api.get(`/v1/${route}/login/sso/emi`);

  return res.json(user.data);
});

router.get('/sso/token/emi', async (req, res) => {
  const { code, code_verifier, browser, os, device, type } = req.query;

  const queryString = {
    code,
    code_verifier,
    browser,
    os,
    device,
    type
  };

  const user = await api.get(`/v1/${route}/sso/token/emi?${objectToQueryString(queryString)}`);

  const accessToken = user.data.data.access_token;
  const refreshToken = user.data.data.id_token;

  res.cookie('Eurokars-Auth-Token-Test', accessToken);
  res.cookie('Eurokars-Auth-Refresh-Token-Test', refreshToken);
  return res.json(user.data);
});

router.put('/refresh-token/sso', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Refresh-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Refresh-Token': accessToken
    }
  };

  const user = await api.put(`/v1/${route}/refresh-token/sso`, {}, headers);

  const {
    access_token: accessTokenResponse,
    refresh_token: refreshTokenResponse
  } = user.data.data;
  res.header('Eurokars-Auth-Token', accessTokenResponse);
  res.header('Eurokars-Auth-Refresh-Token', refreshTokenResponse);

  return res.json(user.data);
});

router.put('/refresh-token/sso/emi', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Refresh-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Refresh-Token': accessToken
    }
  };

  const user = await api.put(`/v1/${route}/refresh-token/sso/emi`, {}, headers);

  const {
    access_token: accessTokenResponse,
    refresh_token: refreshTokenResponse
  } = user.data.data;
  res.header('Eurokars-Auth-Token', accessTokenResponse);
  res.header('Eurokars-Auth-Refresh-Token', refreshTokenResponse);

  return res.json(user.data);
});

router.delete('/logout', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const deviceToken = req.header('Eurokars-Device-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken,
      'Eurokars-Device-Token': deviceToken
    }
  };

  const user = await api.delete(`/v1/${route}/logout`, headers);

  return res.json(user.data);
});

module.exports = router;

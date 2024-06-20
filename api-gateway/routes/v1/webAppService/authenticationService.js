const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../../utils/apiAdapter.js');
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
  const { code } = req.query;

  const user = await api.get(`/v1/${route}/sso/token?code=${code}`);

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

router.get('/login/sso/emi', async (req, res) => {
  const user = await api.get(`/v1/${route}/login/sso/emi`);

  return res.json(user.data);
});

router.get('/sso/token/emi', async (req, res) => {
  const { code } = req.query;

  const user = await api.get(`/v1/${route}/sso/token/emi?code=${code}`);

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

module.exports = router;

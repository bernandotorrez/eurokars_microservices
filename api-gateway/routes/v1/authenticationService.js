const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../utils/apiAdapter.js');
const { URL_AUTH_SERVICE } = process.env;
const api = apiAdapter(URL_AUTH_SERVICE);

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await api.post('/v1/auth/login', { username, password });

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const user = await api.post('/v1/auth/register', { username, password, email });

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

router.put('/refresh-token', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Refresh-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Refresh-Token': accessToken
    }
  };

  const user = await api.put('/v1/auth/refresh-token', {}, headers);

  const accessTokenResponse = user.headers['eurokars-auth-token'];
  res.header('Eurokars-Auth-Token', accessTokenResponse);

  return res.json(user.data);
});

router.delete('/logout', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Refresh-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Refresh-Token': accessToken
    }
  };

  const user = await api.delete('/v1/auth/logout', headers);

  return res.json(user.data);
});

router.get('/login/sso', async (req, res) => {
  const user = await api.get('/v1/auth/login/sso');

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

router.get('/sso/redirect', async (req, res) => {
  const { code } = req.query;

  const user = await api.get(`/v1/auth/sso/redirect?code=${code}`);

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

router.post('/login/sso', async (req, res) => {
  const { username, password } = req.body;

  const user = await api.post('/v1/auth/login/sso', { username, password });

  const accessToken = user.headers['eurokars-auth-token'];
  const refreshToken = user.headers['eurokars-auth-refresh-token'];

  res.header('Eurokars-Auth-Token', accessToken);
  res.header('Eurokars-Auth-Refresh-Token', refreshToken);
  return res.json(user.data);
});

module.exports = router;

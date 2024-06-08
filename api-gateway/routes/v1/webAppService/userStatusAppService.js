const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../../utils/apiAdapter.js');
const { URL_WEBAPP_SERVICE } = process.env;
const api = apiAdapter(URL_WEBAPP_SERVICE);

router.get('/', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const userStatusApp = await api.get(`/v1/user-status-app?${req.url.split('?')[1]}`, headers);
  return res.json(userStatusApp.data);
});

router.get('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const userStatusApp = await api.get(`/v1/user-status-app/${id}`, headers);
  return res.json(userStatusApp.data);
});

router.post('/', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const userStatusApp = await api.post('/v1/user-status-app', req.body, headers);
  return res.json(userStatusApp.data);
});

module.exports = router;

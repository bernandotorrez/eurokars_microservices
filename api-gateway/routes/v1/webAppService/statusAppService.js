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

  const statusApp = await api.get(`/v1/status-app?${req.url.split('?')[1]}`, headers);
  return res.json(statusApp.data);
});

router.get('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const statusApp = await api.get(`/v1/status-app/${id}`, headers);
  return res.json(statusApp.data);
});

router.post('/', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const statusApp = await api.post('/v1/status-app', req.body, headers);
  return res.json(statusApp.data);
});

router.put('/:id', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const { id } = req.params;

  const statusApp = await api.put(`/v1/status-app/${id}`, req.body, headers);
  return res.json(statusApp.data);
});

router.delete('/:id', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const { id } = req.params;

  const statusApp = await api.delete(`/v1/status-app/${id}`, headers);
  return res.json(statusApp.data);
});

module.exports = router;

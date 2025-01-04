const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../../utils/apiAdapter.js');
const { URL_WEBAPP_SERVICE } = process.env;
const api = apiAdapter(URL_WEBAPP_SERVICE);

const route = 'vendor-bank-beneficiary';

router.get('/', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token') ?? ''
    }
  };

  const data = await api.get(`/v1/${route}?${req.url.split('?')[1]}`, headers);
  return res.json(data.data);
});

router.get('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token') ?? '';
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const data = await api.get(`/v1/${route}/${id}`, headers);
  return res.json(data.data);
});

router.post('/', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token') ?? ''
    }
  };

  const data = await api.post(`/v1/${route}`, req.body, headers);
  return res.json(data.data);
});

router.put('/:id', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token') ?? ''
    }
  };

  const { id } = req.params;

  const data = await api.put(`/v1/${route}/${id}`, req.body, headers);
  return res.json(data.data);
});

router.delete('/:id', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token') ?? ''
    }
  };

  const { id } = req.params;

  const data = await api.delete(`/v1/${route}/${id}`, headers);
  return res.json(data.data);
});

module.exports = router;

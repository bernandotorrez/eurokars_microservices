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

  const department = await api.get(`/v1/department?${req.url.split('?')[1]}`, headers);
  return res.json(department.data);
});

router.get('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const department = await api.get(`/v1/department/${id}`, headers);
  return res.json(department.data);
});

router.post('/', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const department = await api.post('/v1/department', req.body, headers);
  return res.json(department.data);
});

router.put('/:id', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const { id } = req.params;

  const department = await api.put(`/v1/department/${id}`, req.body, headers);
  return res.json(department.data);
});

router.delete('/:id', async (req, res) => {
  const headers = {
    headers: {
      'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token')
    }
  };

  const { id } = req.params;

  const department = await api.delete(`/v1/department/${id}`, headers);
  return res.json(department.data);
});

module.exports = router;

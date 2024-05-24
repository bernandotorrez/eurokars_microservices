const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../utils/apiAdapter.js');
const { URL_VEHICLE_SERVICE } = process.env;
const api = apiAdapter(URL_VEHICLE_SERVICE);

router.get('/', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const vehicle = await api.get(`/v1/vehicle?${req.url.split('?')[1]}`, headers);
  return res.json(vehicle.data);
});

router.get('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const vehicle = await api.get(`/v1/vehicle/${id}`, headers);
  return res.json(vehicle.data);
});

router.post('/', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const vehicle = await api.post('/v1/vehicle', req.body, headers);
  return res.json(vehicle.data);
});

router.put('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const vehicle = await api.put(`/v1/vehicle/${id}`, req.body, headers);
  return res.json(vehicle.data);
});

router.delete('/:id', async (req, res) => {
  const accessToken = req.header('Eurokars-Auth-Token');
  const headers = {
    headers: {
      'Eurokars-Auth-Token': accessToken
    }
  };

  const { id } = req.params;
  const vehicle = await api.delete(`/v1/vehicle/${id}`, headers);
  return res.json(vehicle.data);
});

module.exports = router;

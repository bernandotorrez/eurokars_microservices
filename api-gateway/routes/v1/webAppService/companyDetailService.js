const express = require('express');
require('express-async-errors');
const router = express.Router();

// API Adapter
const apiAdapter = require('../../../utils/apiAdapter.js');
const getHeaders = require('../../../utils/getHeaders.js');
const { URL_WEBAPP_SERVICE } = process.env;
const api = apiAdapter(URL_WEBAPP_SERVICE);

const route = 'company-detail';

router.get('/', async (req, res) => {
  const data = await api.get(`/v1/${route}?${req.url.split('?')[1]}`, getHeaders(req));
  return res.json(data.data);
});

router.get('/company/:companyId', async (req, res) => {
  const { companyId } = req.params;

  const data = await api.get(`/v1/${route}/company/${companyId}`, getHeaders(req));
  return res.json(data.data);
});

router.get('/company/:companyId/brand/:brandId', async (req, res) => {
  const { companyId, brandId } = req.params;

  const data = await api.get(`/v1/${route}/company/${companyId}/brand/${brandId}`, getHeaders(req));
  return res.json(data.data);
});

router.get('/company/:companyId/brand/:brandId/branch/:branchId', async (req, res) => {
  const { companyId, brandId, branchId } = req.params;

  const data = await api.get(`/v1/${route}/company/${companyId}/brand/${brandId}/branch/${branchId}`, getHeaders(req));
  return res.json(data.data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const data = await api.get(`/v1/${route}/${id}`, getHeaders(req));
  return res.json(data.data);
});

router.post('/', async (req, res) => {
  const data = await api.post(`/v1/${route}`, req.body, getHeaders(req));
  return res.json(data.data);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const data = await api.put(`/v1/${route}/${id}`, req.body, getHeaders(req));
  return res.json(data.data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const data = await api.delete(`/v1/${route}/${id}`, getHeaders(req));
  return res.json(data.data);
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const cityRepository = require('../../repositories/mysql/cityRepository');

// Validator
const cityValidator = require('../../validators/cityValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const cities = await cityRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: cities
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const city = await cityRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: city
  });
});

router.post('/', async (req, res) => {
  cityValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const city = await cityRepository.add(oid, req.body);

  city.city_id = city.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add City',
    data: city
  });
});

router.put('/:id', async (req, res) => {
  cityValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const city = await cityRepository.update(id, oid, req.body);

  city.city_id = city.null;

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update City',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await cityRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete City',
    data: id
  });
});

module.exports = router;

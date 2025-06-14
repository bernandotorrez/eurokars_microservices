const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const configurationRepository = require('../../repositories/mysql/configurationRepository');

// Validator
const configurationValidator = require('../../validators/configurationValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const configuration = await configurationRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: configuration
  });
});

router.get('/id/:id', async (req, res) => {
  const { id } = req.params;

  const configuration = await configurationRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: configuration
  });
});

router.get('/name/:name', async (req, res) => {
  const { name } = req.params;

  const configuration = await configurationRepository.getOneByName(name);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: configuration
  });
});

router.post('/', async (req, res) => {
  configurationValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const configuration = await configurationRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Configuration',
    data: configuration
  });
});

router.put('/:id', async (req, res) => {
  configurationValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await configurationRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Configuration',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await configurationRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Configuration',
    data: id
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const statusAppRepository = require('../../repositories/mysql/statusAppRepository');

// Validator
const statusAppValidator = require('../../validators/statusAppValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const statusApps = await statusAppRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: statusApps
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const statusApps = await statusAppRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: statusApps
  });
});

router.post('/', async (req, res) => {
  statusAppValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const statusApp = await statusAppRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Status App',
    data: statusApp
  });
});

router.put('/:id', async (req, res) => {
  statusAppValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await statusAppRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Status App',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await statusAppRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Status App',
    data: id
  });
});

module.exports = router;

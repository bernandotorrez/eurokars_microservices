const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const businessLineRepository = require('../../repositories/mysql/businessLineRepository');

// Validator
const businessLineValidator = require('../../validators/businessLineValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const businessLine = await businessLineRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: businessLine
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const businessLine = await businessLineRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: businessLine
  });
});

router.post('/', async (req, res) => {
  businessLineValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const businessLine = await businessLineRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Business Line',
    data: businessLine
  });
});

router.put('/:id', async (req, res) => {
  businessLineValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await businessLineRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Business Line',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await businessLineRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Business Line',
    data: id
  });
});

module.exports = router;

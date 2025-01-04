const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const currencyRepository = require('../../repositories/mysql/currencyRepository');

// Validator
const currencyValidator = require('../../validators/currencyValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const currency = await currencyRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: currency
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const currency = await currencyRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: currency
  });
});

router.post('/', async (req, res) => {
  currencyValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const currency = await currencyRepository.add(oid, req.body);

  currency.currency_id = currency.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Currency',
    data: currency
  });
});

router.put('/:id', async (req, res) => {
  currencyValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await currencyRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Currency',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await currencyRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Currency',
    data: id
  });
});

module.exports = router;

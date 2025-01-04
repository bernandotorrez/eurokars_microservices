const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const bankRepository = require('../../repositories/mysql/bankRepository');

// Validator
const bankValidator = require('../../validators/bankValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const bank = await bankRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const bank = await bankRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.post('/', async (req, res) => {
  bankValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const bank = await bankRepository.add(oid, req.body);

  bank.bank_id = bank.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Bank',
    data: bank
  });
});

router.put('/:id', async (req, res) => {
  bankValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await bankRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Bank',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await bankRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Bank',
    data: id
  });
});

module.exports = router;

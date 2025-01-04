const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const categoryRfaRepository = require('../../repositories/mysql/categoryRfaRepository');

// Validator
const categoryRfaValidator = require('../../validators/categoryRfaValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const categoryRfa = await categoryRfaRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: categoryRfa
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const categoryRfa = await categoryRfaRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: categoryRfa
  });
});

router.post('/', async (req, res) => {
  categoryRfaValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const categoryRfa = await categoryRfaRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Role',
    data: categoryRfa
  });
});

router.put('/:id', async (req, res) => {
  categoryRfaValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await categoryRfaRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Role',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await categoryRfaRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Role',
    data: id
  });
});

module.exports = router;

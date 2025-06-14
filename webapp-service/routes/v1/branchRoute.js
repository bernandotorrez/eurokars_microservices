const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const branchRepository = require('../../repositories/mysql/branchRepository');

// Validator
const branchValidator = require('../../validators/branchValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const branches = await branchRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: branches
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const branch = await branchRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: branch
  });
});

router.post('/', async (req, res) => {
  branchValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const branch = await branchRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Branch',
    data: branch
  });
});

router.put('/:id', async (req, res) => {
  branchValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await branchRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Branch',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await branchRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Branch',
    data: id
  });
});

module.exports = router;

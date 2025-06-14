const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const subCoaRepository = require('../../repositories/mysql/subCoaRepository');

// Validator
const subCoaValidator = require('../../validators/subCoaValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, coa_code: coaCode } = req.query;

  const subCoa = await subCoaRepository.getAll({ search, sort, page, coaCode });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: subCoa
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const subCoa = await subCoaRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: subCoa
  });
});

router.post('/', async (req, res) => {
  subCoaValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const subCoa = await subCoaRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Sub COA',
    data: subCoa
  });
});

router.put('/:id', async (req, res) => {
  subCoaValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await subCoaRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Sub COA',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await subCoaRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Sub COA',
    data: id
  });
});

module.exports = router;

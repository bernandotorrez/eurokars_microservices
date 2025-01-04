const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const taxDetailRepository = require('../../repositories/mysql/taxDetailRepository');

// Validator
const taxDetailValidator = require('../../validators/taxDetailValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, tax_code: taxCode, tax_flag: taxFlag } = req.query;

  const taxDetail = await taxDetailRepository.getAll({ search, sort, page, taxCode, taxFlag });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: taxDetail
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const taxDetail = await taxDetailRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: taxDetail
  });
});

router.post('/', async (req, res) => {
  taxDetailValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const taxDetail = await taxDetailRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Tax Detail',
    data: taxDetail
  });
});

router.put('/:id', async (req, res) => {
  taxDetailValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await taxDetailRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Tax Detail',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await taxDetailRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Tax Detail',
    data: id
  });
});

module.exports = router;

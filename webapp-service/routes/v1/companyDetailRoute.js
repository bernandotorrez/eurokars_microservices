const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const companyDetailRepository = require('../../repositories/mysql/companyDetailRepository');

// Validator
const companyDetailValidator = require('../../validators/companyDetailValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const companyDetail = await companyDetailRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: companyDetail
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const companyDetail = await companyDetailRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: companyDetail
  });
});

router.post('/', async (req, res) => {
  companyDetailValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const companyDetail = await companyDetailRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Company Detail',
    data: companyDetail
  });
});

router.put('/:id', async (req, res) => {
  companyDetailValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await companyDetailRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Company Detail',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await companyDetailRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Company Detail',
    data: id
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const companyRepository = require('../../repositories/mysql/companyRepository');

// Validator
const companyValidator = require('../../validators/companyValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const companies = await companyRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: companies
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const company = await companyRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: company
  });
});

router.post('/', async (req, res) => {
  companyValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const company = await companyRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Company',
    data: company
  });
});

router.put('/:id', async (req, res) => {
  companyValidator.update(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const { id } = req.params;

  await companyRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Company',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await companyRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Company',
    data: id
  });
});

module.exports = router;

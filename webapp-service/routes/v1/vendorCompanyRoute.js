const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const vendorCompanyRepository = require('../../repositories/mysql/vendorCompanyRepository');

// Validator
const vendorCompanyValidator = require('../../validators/vendorCompanyValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const vendorCompany = await vendorCompanyRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vendorCompany
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const vendorCompany = await vendorCompanyRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vendorCompany
  });
});

router.post('/', async (req, res) => {
  vendorCompanyValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const vendorCompany = await vendorCompanyRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Vendor Company',
    data: vendorCompany
  });
});

router.put('/:id', async (req, res) => {
  vendorCompanyValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const update = await vendorCompanyRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Vendor Company',
    data: update
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await vendorCompanyRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Vendor Company',
    data: id
  });
});

module.exports = router;

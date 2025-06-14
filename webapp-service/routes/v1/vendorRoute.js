const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const vendorRepository = require('../../repositories/mysql/vendorRepository');

// Validator
const vendorValidator = require('../../validators/vendorValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const vendor = await vendorRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vendor
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const vendor = await vendorRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vendor
  });
});

router.post('/', async (req, res) => {
  vendorValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const vendor = await vendorRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Vendor',
    data: vendor
  });
});

router.put('/:id', async (req, res) => {
  vendorValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await vendorRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Vendor',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await vendorRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Vendor',
    data: id
  });
});

module.exports = router;

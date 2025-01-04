const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const vendorCompanyDepartmentRepository = require('../../repositories/mysql/vendorCompanyDepartmentRepository');

// Validator
const vendorCompanyDepartmentValidator = require('../../validators/vendorCompanyDepartmentValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const vendorCompanyDepartment = await vendorCompanyDepartmentRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vendorCompanyDepartment
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const vendorCompanyDepartment = await vendorCompanyDepartmentRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vendorCompanyDepartment
  });
});

router.post('/', async (req, res) => {
  vendorCompanyDepartmentValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const vendorCompanyDepartment = await vendorCompanyDepartmentRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Vendor Company Department',
    data: vendorCompanyDepartment
  });
});

router.put('/:id', async (req, res) => {
  vendorCompanyDepartmentValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const vendorCompanyDepartment = await vendorCompanyDepartmentRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Vendor Company Department',
    data: vendorCompanyDepartment
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await vendorCompanyDepartmentRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Vendor Company Department',
    data: id
  });
});

module.exports = router;

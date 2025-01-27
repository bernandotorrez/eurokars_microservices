const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const userDepartmentRepository = require('../../repositories/mysql/userDepartmentRepository');
const auditTrailLogMasterDataRepository = require('../../repositories/mysql/auditTrailLogMasterDataRepository');

// Validator
const userDepartmentValidator = require('../../validators/userDepartmentValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const userDepartments = await userDepartmentRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userDepartments
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userDepartment = await userDepartmentRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userDepartment
  });
});

router.post('/', async (req, res) => {
  userDepartmentValidator.create(req.body);

  const userDepartment = await userDepartmentRepository.add(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await auditTrailLogMasterDataRepository.add({ oid, module: 'User Department', executionType: 'INSERT' });

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Department',
    data: userDepartment
  });
});

router.put('/:id', async (req, res) => {
  userDepartmentValidator.update(req.body);

  const { id } = req.params;

  const userDepartment = await userDepartmentRepository.update(id, req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await auditTrailLogMasterDataRepository.add({ oid, module: 'User Department', executionType: 'UPDATE' });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update User Department',
    data: userDepartment
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await userDepartmentRepository.delete(id);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await auditTrailLogMasterDataRepository.add({ oid, module: 'User Department', executionType: 'DELETE' });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete User Department',
    data: id
  });
});

module.exports = router;

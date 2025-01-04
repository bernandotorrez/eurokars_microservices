const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const rolePermissionRepository = require('../../repositories/mysql/rolePermissionRepository');

// Validator
const rolePermissionValidator = require('../../validators/rolePermissionValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const rolePermission = await rolePermissionRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: rolePermission
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const rolePermission = await rolePermissionRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: rolePermission
  });
});

router.post('/', async (req, res) => {
  rolePermissionValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const rolePermission = await rolePermissionRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Role Permission',
    data: rolePermission
  });
});

router.put('/:id', async (req, res) => {
  rolePermissionValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await rolePermissionRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Role Permission',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await rolePermissionRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Role Permission',
    data: id
  });
});

module.exports = router;

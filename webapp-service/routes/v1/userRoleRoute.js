const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const userRoleRepository = require('../../repositories/mysql/userRoleRepository');

// Validator
const userRoleValidator = require('../../validators/userRoleValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const userRoles = await userRoleRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userRoles
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userRoles = await userRoleRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userRoles
  });
});

router.post('/', async (req, res) => {
  userRoleValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userRole = await userRoleRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Role',
    data: userRole
  });
});

router.put('/:id', async (req, res) => {
  userRoleValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userRole = await userRoleRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update User Role',
    data: userRole
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await userRoleRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete User Role',
    data: id
  });
});

module.exports = router;

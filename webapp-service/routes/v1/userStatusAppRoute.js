const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const userStatusAppRepository = require('../../repositories/mysql/userStatusAppRepository');

// Validator
const userStatusAppValidator = require('../../validators/userStatusAppValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const userStatusApps = await userStatusAppRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userStatusApps
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userStatusApps = await userStatusAppRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userStatusApps
  });
});

router.post('/', async (req, res) => {
  userStatusAppValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userStatusApp = await userStatusAppRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Status App',
    data: userStatusApp
  });
});

router.put('/:id', async (req, res) => {
  userStatusAppValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userStatusApp = await userStatusAppRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update User Status App',
    data: userStatusApp
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await userStatusAppRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete User Status App',
    data: id
  });
});

module.exports = router;

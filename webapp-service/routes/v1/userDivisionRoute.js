const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const userDivisionRepository = require('../../repositories/mysql/userDivisionRepository');

// Validator
const userDivisionValidator = require('../../validators/userDivisionValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const userDivisions = await userDivisionRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userDivisions
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userDivision = await userDivisionRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userDivision
  });
});

router.post('/', async (req, res) => {
  userDivisionValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userDivision = await userDivisionRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Division',
    data: userDivision
  });
});

router.put('/:id', async (req, res) => {
  userDivisionValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userDivision = await userDivisionRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update User Division',
    data: userDivision
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await userDivisionRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete User Division',
    data: id
  });
});

module.exports = router;

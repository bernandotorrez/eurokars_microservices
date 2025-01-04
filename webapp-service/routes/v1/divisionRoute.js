const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const divisionRepository = require('../../repositories/mysql/divisionRepository');

// Validator
const divisionValidator = require('../../validators/divisionValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, department_id: departmentId } = req.query;

  const division = await divisionRepository.getAll({ search, sort, page, departmentId });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: division
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const division = await divisionRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: division
  });
});

router.post('/', async (req, res) => {
  divisionValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const division = await divisionRepository.add(oid, req.body);

  division.division_id = division.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Division',
    data: division
  });
});

router.put('/:id', async (req, res) => {
  divisionValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const division = await divisionRepository.update(id, oid, req.body);

  division.division_id = division.null;

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Division',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await divisionRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Division',
    data: id
  });
});

module.exports = router;

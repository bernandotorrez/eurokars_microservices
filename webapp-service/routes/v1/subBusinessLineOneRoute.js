const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const subBusinessLineOneRepository = require('../../repositories/mysql/subBusinessLineOneRepository');

// Validator
const subBusinessLineOneValidator = require('../../validators/subBusinessLineOneValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const subBusinessLineOne = await subBusinessLineOneRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: subBusinessLineOne
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const subBusinessLineOne = await subBusinessLineOneRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: subBusinessLineOne
  });
});

router.post('/', async (req, res) => {
  subBusinessLineOneValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const subBusinessLineOne = await subBusinessLineOneRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Sub Business Line One',
    data: subBusinessLineOne
  });
});

router.put('/:id', async (req, res) => {
  subBusinessLineOneValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await subBusinessLineOneRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Sub Business Line One',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await subBusinessLineOneRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Sub Business Line One',
    data: id
  });
});

module.exports = router;

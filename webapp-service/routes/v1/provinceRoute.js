const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const provinceRepository = require('../../repositories/mysql/provinceRepository');

// Validator
const provinceValidator = require('../../validators/provinceValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const provinces = await provinceRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: provinces
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const province = await provinceRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: province
  });
});

router.post('/', async (req, res) => {
  provinceValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const province = await provinceRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Province',
    data: province
  });
});

router.put('/:id', async (req, res) => {
  provinceValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await provinceRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Province',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await provinceRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Province',
    data: id
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const subBusinessLineTwoRepository = require('../../repositories/mysql/subBusinessLineTwoRepository');

// Validator
const subBusinessLineTwoValidator = require('../../validators/subBusinessLineTwoValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const subBusinessLineTwo = await subBusinessLineTwoRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: subBusinessLineTwo
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const subBusinessLineTwo = await subBusinessLineTwoRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: subBusinessLineTwo
  });
});

router.post('/', async (req, res) => {
  subBusinessLineTwoValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const subBusinessLineTwo = await subBusinessLineTwoRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Sub Business Line Two',
    data: subBusinessLineTwo
  });
});

router.put('/:id', async (req, res) => {
  subBusinessLineTwoValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await subBusinessLineTwoRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Sub Business Line Two',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await subBusinessLineTwoRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Sub Business Line Two',
    data: id
  });
});

module.exports = router;

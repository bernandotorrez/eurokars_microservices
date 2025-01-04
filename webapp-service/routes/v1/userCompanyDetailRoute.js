const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const userCompanyDetailRepository = require('../../repositories/mysql/userCompanyDetailRepository');

// Validator
const userCompanyDetailValidator = require('../../validators/userCompanyDetailValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const userCompanyDetails = await userCompanyDetailRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userCompanyDetails
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userCompanyDetail = await userCompanyDetailRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userCompanyDetail
  });
});

router.post('/', async (req, res) => {
  userCompanyDetailValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userCompanyDetail = await userCompanyDetailRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Company Detail',
    data: userCompanyDetail
  });
});

router.put('/:id', async (req, res) => {
  userCompanyDetailValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const userCompanyDetail = await userCompanyDetailRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update User Company Detail',
    data: userCompanyDetail
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await userCompanyDetailRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete User Company Detail',
    data: id
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const menuGroupRepository = require('../../repositories/mysql/menuGroupRepository');

// Validator
const menuGroupValidator = require('../../validators/menuGroupValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const menuGroup = await menuGroupRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: menuGroup
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const menuGroup = await menuGroupRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: menuGroup
  });
});

router.post('/', async (req, res) => {
  menuGroupValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const menuGroup = await menuGroupRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Menu Group',
    data: menuGroup
  });
});

router.put('/:id', async (req, res) => {
  menuGroupValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await menuGroupRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Menu Group',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await menuGroupRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Menu Group',
    data: id
  });
});

module.exports = router;

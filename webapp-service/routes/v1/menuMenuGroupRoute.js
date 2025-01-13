const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const menuMenuGroupRepository = require('../../repositories/mysql/menuMenuGroupRepository');

// Validator
const menuMenuGroupValidator = require('../../validators/menuMenuGroupValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, menu_group_id: menuGroupId } = req.query;

  let menuMenuGroups;

  if (menuGroupId !== '' && typeof menuGroupId !== 'undefined') {
    menuMenuGroups = await menuMenuGroupRepository.getAllByMenuGroup(menuGroupId);
  } else {
    menuMenuGroups = await menuMenuGroupRepository.getAll({ search, sort, page, menuGroupId });
  }

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: menuMenuGroups
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const menuMenuGroups = await menuMenuGroupRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: menuMenuGroups
  });
});

router.post('/', async (req, res) => {
  menuMenuGroupValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const menuMenuGroup = await menuMenuGroupRepository.add(oid, req.body);

  menuMenuGroup.user_status_app_id = menuMenuGroup.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Menu Menu Group',
    data: menuMenuGroup
  });
});

router.put('/:id', async (req, res) => {
  menuMenuGroupValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const menuMenuGroup = await menuMenuGroupRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Menu Menu Group',
    data: menuMenuGroup
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await menuMenuGroupRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Menu Menu Group',
    data: id
  });
});

module.exports = router;

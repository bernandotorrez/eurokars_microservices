const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const headerNavigationRepository = require('../../repositories/mysql/headerNavigationRepository');

// Validator
const headerNavigationValidator = require('../../validators/headerNavigationValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, unique_id: uniqueId } = req.query;

  const headerNavigation = await headerNavigationRepository.getAll({ search, sort, page, uniqueId });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: headerNavigation
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const headerNavigation = await headerNavigationRepository.getOneByUniqueId(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: headerNavigation
  });
});

router.post('/', async (req, res) => {
  headerNavigationValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const headerNavigation = await headerNavigationRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Header Navigation',
    data: headerNavigation
  });
});

router.put('/:id', async (req, res) => {
  headerNavigationValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await headerNavigationRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Header Navigation',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await headerNavigationRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Header Navigation',
    data: id
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');

// Repositories
const statusAppRepository = require('../../repositories/mysql/statusAppRepository');

// Validator
const statusAppValidator = require('../../validators/statusAppValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const statusApps = await statusAppRepository.getStatusApps({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: statusApps
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const statusApps = await statusAppRepository.getStatusApp(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: statusApps
  });
});

router.post('/', async (req, res) => {
  statusAppValidator.statusAppValidator(req.body);

  const statusApp = await statusAppRepository.addStatusApp(req.body);

  statusApp.id_statusApp = statusApp.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Status App',
    data: statusApp
  });
});

router.put('/:id', async (req, res) => {
  statusAppValidator.statusAppValidator(req.body);

  const { id } = req.params;

  await statusAppRepository.updateStatusApp(id, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Status App',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await statusAppRepository.deleteStatusApp(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Status App',
    data: id
  });
});

module.exports = router;

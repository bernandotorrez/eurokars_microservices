const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');

// Repositories
const userStatusAppRepository = require('../../repositories/mysql/userStatusAppRepository');

// Validator
const userStatusAppValidator = require('../../validators/userStatusAppValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const userStatusApps = await userStatusAppRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userStatusApps
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userStatusApps = await userStatusAppRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userStatusApps
  });
});

router.post('/', async (req, res) => {
  userStatusAppValidator.createValidator(req.body);

  const userStatusApp = await userStatusAppRepository.add(req.body);

  userStatusApp.id_user_status_app = userStatusApp.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Status App',
    data: userStatusApp
  });
});

router.put('/:id', async (req, res) => {
  userStatusAppValidator.updateValidator(req.body);

  const { id } = req.params;

  const userStatusApp = await userStatusAppRepository.update(id, req.body);

  userStatusApp.id_user_status_app = userStatusApp.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Status App',
    data: userStatusApp
  });
});

module.exports = router;

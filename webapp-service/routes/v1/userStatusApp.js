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

  const userStatusApps = await userStatusAppRepository.getUserStatusApps({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userStatusApps
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userStatusApps = await userStatusAppRepository.getUserStatusApp(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userStatusApps
  });
});

router.post('/', async (req, res) => {
  userStatusAppValidator.userStatusAppValidator(req.body);

  const userStatusApp = await userStatusAppRepository.addUserStatusApp(req.body);

  userStatusApp.id_user_status_app = userStatusApp.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add User Status App',
    data: userStatusApp
  });
});

module.exports = router;

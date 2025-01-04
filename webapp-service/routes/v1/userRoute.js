const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const jwt = require('jsonwebtoken');
const { JWT_PRIVATE_KEY } = process.env;

// Repositories
const userRepository = require('../../repositories/mysql/userRepository');

// RabbitMQ
const rabbitMqRepository = require('../../repositories/messageBroker/rabbitmqRepository');

// Validator
// const userValidator = require('../../validators/userValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const user = await userRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: user
  });
});

router.get('/self', async (req, res) => {
  const header = req.header('Eurokars-Auth-Token');

  const decodedJwt = jwt.decode(header, JWT_PRIVATE_KEY);

  const { oid } = decodedJwt;

  const user = await userRepository.getById(oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Get User',
    data: user
  });
});

router.post('/reset/pass', async (req, res) => {
  const header = req.header('Eurokars-Auth-Token');

  const decodedJwt = jwt.decode(header, JWT_PRIVATE_KEY);

  const { sub } = decodedJwt;

  const user = await userRepository.getUserByUuid(sub);

  const rabbitMq = await rabbitMqRepository.sendMessagNew(user.email);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Reset Pass',
    data: rabbitMq
  });
});

router.get('/device', async (req, res) => {
  const header = req.header('Eurokars-Auth-Token');

  const decodedJwt = jwt.decode(header, JWT_PRIVATE_KEY);

  const { oid } = decodedJwt;

  const userDevices = await userRepository.getDevice(oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userDevices
  });
});

router.get('/device/token', async (req, res) => {
  const token = req.header('Eurokars-Device-Token');

  const userDevice = await userRepository.getDeviceByToken(token);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: userDevice
  });
});

router.put('/device/revoke', async (req, res) => {
  const { token } = req.body;

  const revokeDevice = await userRepository.revokeDevice(token);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Revoke Device',
    data: revokeDevice
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;

// Repositories
const counterNumberRepository = require('../../repositories/mysql/counterNumberRepository');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const cities = await counterNumberRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: cities
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const counterNumber = await counterNumberRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: counterNumber
  });
});

module.exports = router;

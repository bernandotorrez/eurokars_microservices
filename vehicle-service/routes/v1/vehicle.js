const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');

// Repositories
const vehicleRepository = require('../../repositories/mysql/vehicleRepository');

// Validator
const vehicleValidator = require('../../validators/vehicleValidator');

// Cached
// const cacheRepository = require('../../repositories/redis/cacheRepository');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const vehicles = await vehicleRepository.getVehicles({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vehicles
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const vehicles = await vehicleRepository.getVehicle(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: vehicles
  });
});

router.post('/', async (req, res) => {
  vehicleValidator.vehicleValidator(req.body);

  const vehicle = await vehicleRepository.addVehicle(req.body);

  vehicle.id_vehicle = vehicle.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Vehicle',
    data: vehicle
  });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  vehicleValidator.vehicleValidator(req.body);

  await vehicleRepository.updateVehicle(id, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Update Vehicle',
    data: req.body
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await vehicleRepository.deleteVehicle(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Vehicle',
    data: null
  });
});

module.exports = router;

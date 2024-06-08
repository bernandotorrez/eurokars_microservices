const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status');

// Repositories
const departmentRepository = require('../../repositories/mysql/departmentRepository');

// Validator
const departmentValidator = require('../../validators/departmentValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const departments = await departmentRepository.getDepartments({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: departments
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const department = await departmentRepository.getDepartment(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: department
  });
});

router.post('/', async (req, res) => {
  departmentValidator.departmentValidator(req.body);

  const department = await departmentRepository.addDepartment(req.body);

  department.id_department = department.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Department',
    data: department
  });
});

router.put('/:id', async (req, res) => {
  departmentValidator.departmentValidator(req.body);

  const { id } = req.params;

  await departmentRepository.updateDepartment(id, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Department',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await departmentRepository.deleteDepartment(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Department',
    data: id
  });
});

module.exports = router;

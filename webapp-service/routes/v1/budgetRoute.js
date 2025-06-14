const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const budgetRepository = require('../../repositories/mysql/budgetRepository');

// Validator
const budgetValidator = require('../../validators/budgetValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, year, company_id: companyId, department_id: departmentId } = req.query;

  const budget = await budgetRepository.getAll({ search, sort, page, year, companyId, departmentId });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: budget
  });
});

router.get('/existing-year', async (req, res) => {

  const budget = await budgetRepository.getDistinctYear();

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: budget
  });
});

router.get('/insert-year', async (req, res) => {

  const budget = await budgetRepository.getInsertYear();

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: budget
  });
});

router.get('/generate-code', async (req, res) => {
  budgetValidator.generateCode(req.query);

  const { company_id: companyId, year } = req.query;

  const budget = await budgetRepository.generateBudgetCode(companyId, year);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Generate Code',
    data: budget
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const budget = await budgetRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: budget
  });
});

router.post('/bulk-insert', async (req, res) => {
  budgetValidator.createBulk(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const budget = await budgetRepository.addBulk(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Budget',
    data: budget
  });
});

router.post('/', async (req, res) => {
  budgetValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const budget = await budgetRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Budget',
    data: budget
  });
});

router.put('/:id', async (req, res) => {
  budgetValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await budgetRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update budget',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await budgetRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Budget',
    data: id
  });
});

module.exports = router;

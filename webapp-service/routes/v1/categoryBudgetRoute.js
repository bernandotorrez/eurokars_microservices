const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const categoryBudgetRepository = require('../../repositories/mysql/categoryBudgetRepository');

// Validator
const categoryBudgetValidator = require('../../validators/categoryBudgetValidator');

router.get('/', async (req, res) => {
  const { search, sort, page, year, company_id: companyId, department_id: departmentId } = req.query;

  const categoryBudget = await categoryBudgetRepository.getAll({ search, sort, page, year, companyId, departmentId });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: categoryBudget
  });
});

router.get('/budget/:id', async (req, res) => {
  const { id } = req.params;

  const categoryBudget = await categoryBudgetRepository.getAllByBudgetId(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: categoryBudget
  });
});

router.get('/generate-code', async (req, res) => {
  categoryBudgetValidator.generateCode(req.query);

  const { budget_id: budgetId } = req.query;

  const categoryBudget = await categoryBudgetRepository.generateCategoryBudgetCode(budgetId);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Generate Code',
    data: categoryBudget
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const categoryBudget = await categoryBudgetRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: categoryBudget
  });
});

router.post('/', async (req, res) => {
  categoryBudgetValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const categoryBudget = await categoryBudgetRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Category Budget',
    data: categoryBudget
  });
});

router.put('/:id', async (req, res) => {
  categoryBudgetValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await categoryBudgetRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Category Budget',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await categoryBudgetRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Category Budget',
    data: id
  });
});

module.exports = router;

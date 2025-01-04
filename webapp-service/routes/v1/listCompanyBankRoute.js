const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const listCompanyBankRepository = require('../../repositories/mysql/listCompanyBankRepository');
const auditTrailLogMasterDataRepository = require('../../repositories/mysql/auditTrailLogMasterDataRepository');

// Validator
const listCompanyBankValidator = require('../../validators/listCompanyBankValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const bank = await listCompanyBankRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const bank = await listCompanyBankRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.post('/', async (req, res) => {
  listCompanyBankValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const bank = await listCompanyBankRepository.add(oid, req.body);

  bank.bank_id = bank.null;

  await auditTrailLogMasterDataRepository.add({ oid, module: 'List Company Bank', executionType: 'INSERT' });

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add List Company Bank',
    data: bank
  });
});

router.put('/:id', async (req, res) => {
  listCompanyBankValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await listCompanyBankRepository.update(id, oid, req.body);

  await auditTrailLogMasterDataRepository.add({ oid, module: 'List Company Bank', executionType: 'UPDATE' });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update List Company Bank',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await listCompanyBankRepository.delete(id, oid);

  await auditTrailLogMasterDataRepository.add({ oid, module: 'List Company Bank', executionType: 'DELETE' });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete List Company Bank',
    data: id
  });
});

module.exports = router;

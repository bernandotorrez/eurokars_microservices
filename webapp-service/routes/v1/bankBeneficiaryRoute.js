const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const bankBeneficiaryRepository = require('../../repositories/mysql/bankBeneficiaryRepository');
const auditTrailLogMasterDataRepository = require('../../repositories/mysql/auditTrailLogMasterDataRepository');

// Validator
const bankBeneficiaryValidator = require('../../validators/bankBeneficiaryValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const bank = await bankBeneficiaryRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const bank = await bankBeneficiaryRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.post('/', async (req, res) => {
  bankBeneficiaryValidator.create(req.body);

  const bank = await bankBeneficiaryRepository.add(req.body);

  bank.bank_id = bank.null;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await auditTrailLogMasterDataRepository.add({ oid, module: 'Bank Beneficiary', executionType: 'INSERT' });

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Bank Beneficiary',
    data: bank
  });
});

router.put('/:id', async (req, res) => {
  bankBeneficiaryValidator.create(req.body);

  const { id } = req.params;

  await bankBeneficiaryRepository.update(id, req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await auditTrailLogMasterDataRepository.add({ oid, module: 'Bank Beneficiary', executionType: 'UPDATE' });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Bank Beneficiary',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await bankBeneficiaryRepository.delete(id);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await auditTrailLogMasterDataRepository.add({ oid, module: 'Bank Beneficiary', executionType: 'DELETE' });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Bank Beneficiary',
    data: id
  });
});

module.exports = router;

const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const companyBankBeneficiaryRepository = require('../../repositories/mysql/companyBankBeneficiaryRepository');

// Validator
const companyBankBeneficiaryValidator = require('../../validators/companyBankBeneficiaryValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const bank = await companyBankBeneficiaryRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const bank = await companyBankBeneficiaryRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.post('/', async (req, res) => {
  companyBankBeneficiaryValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const bank = await companyBankBeneficiaryRepository.add(oid, req.body);

  bank.bank_id = bank.null;

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Company Bank Beneficiary',
    data: bank
  });
});

router.put('/:id', async (req, res) => {
  companyBankBeneficiaryValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await companyBankBeneficiaryRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Company Bank Beneficiary',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await companyBankBeneficiaryRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Company Bank Beneficiary',
    data: id
  });
});

module.exports = router;

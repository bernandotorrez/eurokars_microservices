const express = require('express');
require('express-async-errors');
const router = express.Router();
const httpStatus = require('http-status').status;
const { getuserId } = require('../../utils/tokenManager');

// Repositories
const vendorBankBeneficiaryRepository = require('../../repositories/mysql/vendorBankBeneficiaryRepository');

// Validator
const vendorBankBeneficiaryValidator = require('../../validators/vendorBankBeneficiaryValidator');

router.get('/', async (req, res) => {
  const { search, sort, page } = req.query;

  const bank = await vendorBankBeneficiaryRepository.getAll({ search, sort, page });

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const bank = await vendorBankBeneficiaryRepository.getOne(id);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Retrieve Data',
    data: bank
  });
});

router.post('/', async (req, res) => {
  vendorBankBeneficiaryValidator.create(req.body);

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  const bank = await vendorBankBeneficiaryRepository.add(oid, req.body);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    success: true,
    message: 'Successfully Add Vendor Bank Beneficiary',
    data: bank
  });
});

router.put('/:id', async (req, res) => {
  vendorBankBeneficiaryValidator.update(req.body);

  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await vendorBankBeneficiaryRepository.update(id, oid, req.body);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Update Vendor Bank Beneficiary',
    data: id
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { oid } = getuserId(req.header('Eurokars-Auth-Token') ?? '');

  await vendorBankBeneficiaryRepository.delete(id, oid);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    success: true,
    message: 'Successfully Delete Vendor Bank Beneficiary',
    data: id
  });
});

module.exports = router;

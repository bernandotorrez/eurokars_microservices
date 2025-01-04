const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly, numericOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  vendor_id: Joi.string().min(1).max(50).required(),
  bank_id: Joi.string().min(1).max(50).required(),
  beneficiary_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('beneficiary_name', '2', '100'),
      'string.max': charMinMaxLength('beneficiary_name', '2', '100'),
      'string.pattern.name': alphabetOnly('beneficiary_name')
    }),
  account_number: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('account_number', '6', '100'),
      'string.max': charMinMaxLength('account_number', '6', '100'),
      'string.pattern.name': numericOnly('account_number')
    }),
  screen_id: Joi.string().min(3).max(10).required()
});

const create = (payload) => {
  const validationResult = createSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

const updateSchema = Joi.object({
  vendor_id: Joi.string().min(1).max(50).required(),
  bank_id: Joi.string().min(1).max(50).required(),
  beneficiary_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('beneficiary_name', '2', '100'),
      'string.max': charMinMaxLength('beneficiary_name', '2', '100'),
      'string.pattern.name': alphabetOnly('beneficiary_name')
    }),
  account_number: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('account_number', '6', '100'),
      'string.max': charMinMaxLength('account_number', '6', '100'),
      'string.pattern.name': numericOnly('account_number')
    })
});

const update = (payload) => {
  const validationResult = updateSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  create,
  update
};

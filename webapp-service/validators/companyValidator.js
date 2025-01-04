const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, numericOnly, alphabetOnly, fixLength } = require('../utils/validationMessage');

const createSchema = Joi.object({
  company_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('company_name', '2', '50'),
      'string.max': charMinMaxLength('company_name', '2', '50'),
      'string.pattern.name': alphabetOnly('company_name')
    }),
  company_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(3)
    .required()
    .messages({
      'string.min': fixLength('company_code', '3'),
      'string.max': fixLength('company_code', '3'),
      'string.pattern.name': alphabetOnly('company_code')
    }),
  tax_id: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(15)
    .max(16)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_id', '15', '16'),
      'string.max': charMinMaxLength('tax_id', '15', '16'),
      'string.pattern.name': numericOnly('tax_id')
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
  company_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('company_name', '2', '50'),
      'string.max': charMinMaxLength('company_name', '2', '50'),
      'string.pattern.name': alphabetOnly('company_name')
    }),
  company_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(3)
    .required()
    .messages({
      'string.min': fixLength('company_code', '3'),
      'string.max': fixLength('company_code', '3'),
      'string.pattern.name': alphabetOnly('company_code')
    }),
  tax_id: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(15)
    .max(16)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_id', '15', '16'),
      'string.max': charMinMaxLength('tax_id', '15', '16'),
      'string.pattern.name': numericOnly('tax_id')
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

const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, numericOnly, fixLength, alphabetOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  vendor_name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('vendor', '3', '100'),
      'string.max': charMinMaxLength('vendor', '3', '100')
    }),
  address: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.min': charMinMaxLength('address', '3', '500'),
      'string.max': charMinMaxLength('address', '3', '500')
    }),
  contact_person: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('contact_person', '3', '100'),
      'string.max': charMinMaxLength('contact_person', '3', '100'),
      'string.pattern.name': alphabetOnly('contact_person')
    }),
  email: Joi.string().min(3).max(100).required(),
  tax_id: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(15)
    .max(16)
    .messages({
      'string.min': charMinMaxLength('tax_id', '15', '16'),
      'string.max': charMinMaxLength('tax_id', '15', '16'),
      'string.pattern.name': numericOnly('tax_id')
    }),
  identity_number: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(10)
    .max(25)
    .messages({
      'string.min': charMinMaxLength('identity_number', '10', '25'),
      'string.max': charMinMaxLength('identity_number', '10', '25'),
      'string.pattern.name': numericOnly('identity_number')
    }),
  is_national: Joi.string()
    .pattern(/^(0|1)$/)
    .min(1)
    .max(1)
    .required()
    .messages({
      'string.min': fixLength('is_national', '1', '1'),
      'string.max': fixLength('is_national', '1', '1'),
      'string.pattern.name': '"Is National can only fill with 0 or 1"'
    }),
  is_company: Joi.string()
    .pattern(/^(0|1)$/)
    .min(1)
    .max(1)
    .required()
    .messages({
      'string.min': fixLength('is_company', '1', '1'),
      'string.max': fixLength('is_company', '1', '1'),
      'string.pattern.name': '"Is National can only fill with 0 or 1"'
    }),
  phone: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(6)
    .max(20)
    .messages({
      'string.min': charMinMaxLength('phone', '6', '20'),
      'string.max': charMinMaxLength('phone', '6', '20'),
      'string.pattern.name': numericOnly('phone')
    }),
  telephone: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(6)
    .max(20)
    .messages({
      'string.min': charMinMaxLength('telephone', '6', '20'),
      'string.max': charMinMaxLength('telephone', '6', '20'),
      'string.pattern.name': numericOnly('telephone')
    }),
  fax: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(6)
    .max(25)
    .messages({
      'string.min': charMinMaxLength('fax', '6', '25'),
      'string.max': charMinMaxLength('fax', '6', '25'),
      'string.pattern.name': numericOnly('fax')
    }),
  postal_code: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(3)
    .max(25)
    .required()
    .messages({
      'string.min': charMinMaxLength('postal_code', '3', '25'),
      'string.max': charMinMaxLength('postal_code', '3', '25'),
      'string.pattern.name': numericOnly('postal_code')
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
  vendor_name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('vendor', '3', '100'),
      'string.max': charMinMaxLength('vendor', '3', '100')
    }),
  address: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.min': charMinMaxLength('address', '3', '500'),
      'string.max': charMinMaxLength('address', '3', '500')
    }),
  contact_person: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('contact_person', '3', '100'),
      'string.max': charMinMaxLength('contact_person', '3', '100'),
      'string.pattern.name': alphabetOnly('contact_person')
    }),
  email: Joi.string().min(3).max(100).required(),
  tax_id: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(15)
    .max(16)
    .messages({
      'string.min': charMinMaxLength('tax_id', '15', '16'),
      'string.max': charMinMaxLength('tax_id', '15', '16'),
      'string.pattern.name': numericOnly('tax_id')
    }),
  identity_number: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(10)
    .max(25)
    .messages({
      'string.min': charMinMaxLength('identity_number', '10', '25'),
      'string.max': charMinMaxLength('identity_number', '10', '25'),
      'string.pattern.name': numericOnly('identity_number')
    }),
  is_national: Joi.string()
    .pattern(/^(0|1)$/)
    .min(1)
    .max(1)
    .required()
    .messages({
      'string.min': fixLength('is_national', '1', '1'),
      'string.max': fixLength('is_national', '1', '1'),
      'string.pattern.name': '"Is National can only fill with 0 or 1"'
    }),
  is_company: Joi.string()
    .pattern(/^(0|1)$/)
    .min(1)
    .max(1)
    .required()
    .messages({
      'string.min': fixLength('is_company', '1', '1'),
      'string.max': fixLength('is_company', '1', '1'),
      'string.pattern.name': '"Is National can only fill with 0 or 1"'
    }),
  phone: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(6)
    .max(20)
    .messages({
      'string.min': charMinMaxLength('phone', '6', '20'),
      'string.max': charMinMaxLength('phone', '6', '20'),
      'string.pattern.name': numericOnly('phone')
    }),
  telephone: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(6)
    .max(20)
    .messages({
      'string.min': charMinMaxLength('telephone', '6', '20'),
      'string.max': charMinMaxLength('telephone', '6', '20'),
      'string.pattern.name': numericOnly('telephone')
    }),
  fax: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .allow('')
    .min(6)
    .max(25)
    .messages({
      'string.min': charMinMaxLength('fax', '6', '25'),
      'string.max': charMinMaxLength('fax', '6', '25'),
      'string.pattern.name': numericOnly('fax')
    }),
  postal_code: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(3)
    .max(25)
    .required()
    .messages({
      'string.min': charMinMaxLength('postal_code', '3', '25'),
      'string.max': charMinMaxLength('postal_code', '3', '25'),
      'string.pattern.name': numericOnly('postal_code')
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

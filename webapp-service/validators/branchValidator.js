const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly, numericOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  city_id: Joi.string().min(1).max(50).required(),
  branch_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('branch', '2', '50'),
      'string.max': charMinMaxLength('branch', '2', '50'),
      'string.pattern.name': alphabetOnly('branch')
    }),
  address: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.min': charMinMaxLength('address', '3', '500'),
      'string.max': charMinMaxLength('address', '3', '500')
    }),
  phone: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(9)
    .max(15)
    .required()
    .messages({
      'string.min': charMinMaxLength('phone', '9', '15'),
      'string.max': charMinMaxLength('phone', '9', '15'),
      'string.pattern.name': numericOnly('phone')
    }),
  fax: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(6)
    .max(25)
    .allow('')
    .messages({
      'string.min': charMinMaxLength('fax', '6', '25'),
      'string.max': charMinMaxLength('fax', '6', '25'),
      'string.pattern.name': numericOnly('fax')
    }),
  email: Joi.string().email().min(3).max(100).required().messages({
    'string.min': charMinMaxLength('email', '3', '100'),
    'string.max': charMinMaxLength('email', '3', '100')
  }),
  branch_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(5)
    .required()
    .messages({
      'string.min': charMinMaxLength('branch_code', '2', '5'),
      'string.max': charMinMaxLength('branch_code', '2', '5')
    }),
  screen_id: Joi.string().min(3).max(10).required()
});

const create = (payload) => {
  const validationResult = createSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(
      convertMessage(validationResult.error.details)
    );
    throw new BadRequestError(error);
  }
};

const updateSchema = Joi.object({
  city_id: Joi.string().min(1).max(50).required(),
  branch_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('branch', '2', '50'),
      'string.max': charMinMaxLength('branch', '2', '50'),
      'string.pattern.name': alphabetOnly('branch')
    }),
  address: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.min': charMinMaxLength('address', '3', '500'),
      'string.max': charMinMaxLength('address', '3', '500')
    }),
  phone: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(9)
    .max(15)
    .required()
    .messages({
      'string.min': charMinMaxLength('phone', '9', '15'),
      'string.max': charMinMaxLength('phone', '9', '15'),
      'string.pattern.name': numericOnly('phone')
    }),
  fax: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(6)
    .max(25)
    .allow('')
    .messages({
      'string.min': charMinMaxLength('fax', '6', '25'),
      'string.max': charMinMaxLength('fax', '6', '25'),
      'string.pattern.name': numericOnly('fax')
    }),
  email: Joi.string().email().min(3).max(100).required().messages({
    'string.min': charMinMaxLength('email', '3', '100'),
    'string.max': charMinMaxLength('email', '3', '100')
  }),
  branch_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(5)
    .required()
    .messages({
      'string.min': charMinMaxLength('branch_code', '2', '5'),
      'string.max': charMinMaxLength('branch_code', '2', '5')
    })
});

const update = (payload) => {
  const validationResult = updateSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(
      convertMessage(validationResult.error.details)
    );
    throw new BadRequestError(error);
  }
};

module.exports = {
  create,
  update
};

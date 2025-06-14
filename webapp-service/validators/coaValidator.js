const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const {
  convertMessage
} = require('../utils/globalFunction');
const {
  charMinMaxLength,
  alphabetOnly
} = require('../utils/validationMessage');

const createSchema = Joi.object({
  coa_code: Joi.string()
    .pattern(/^[A-Za-z0-9]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_code', '2', '10'),
      'string.max': charMinMaxLength('coa_code', '2', '10'),
      'string.pattern.name': alphabetOnly('coa_code')
    }),
  coa_name: Joi.string()
    .pattern(/^[A-Za-z0-9 ]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_name', '2', '50'),
      'string.max': charMinMaxLength('coa_name', '2', '50'),
      'string.pattern.name': alphabetOnly('coa_name')
    }),
  coa_description: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_description', '2', '200'),
      'string.max': charMinMaxLength('coa_description', '2', '200'),
      'string.pattern.name': alphabetOnly('coa_description')
    }),
  screen_id: Joi.string().min(3).max(10).required()
});

/**
 * Validate COA data before create.
 * @param {Object} payload - object that contains COA data.
 * @throws {BadRequestError} if payload is invalid.
 */
const create = (payload) => {
  const validationResult = createSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

const updateSchema = Joi.object({
  coa_code: Joi.string()
    .pattern(/^[A-Za-z0-9]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_code', '2', '10'),
      'string.max': charMinMaxLength('coa_code', '2', '10'),
      'string.pattern.name': alphabetOnly('coa_code')
    }),
  coa_name: Joi.string()
    .pattern(/^[A-Za-z0-9 ]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_name', '2', '50'),
      'string.max': charMinMaxLength('coa_name', '2', '50'),
      'string.pattern.name': alphabetOnly('coa_name')
    }),
  coa_description: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_description', '2', '200'),
      'string.max': charMinMaxLength('coa_description', '2', '200'),
      'string.pattern.name': alphabetOnly('coa_description')
    }),
});

/**
 * Validate COA data before update.
 * @param {Object} payload - object that contains COA data.
 * @throws {BadRequestError} if payload is invalid.
 */
const update = (payload) => {
  const validationResult = updateSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  create,
  update
};

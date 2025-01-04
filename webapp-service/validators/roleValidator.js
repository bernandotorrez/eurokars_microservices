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
  role_code: Joi.string()
    .pattern(/^[A-Za-z0-9]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.min': charMinMaxLength('role_code', '2', '10'),
      'string.max': charMinMaxLength('role_code', '2', '10'),
      'string.pattern.name': alphabetOnly('role_code')
    }),
  role_name: Joi.string()
    .pattern(/^[A-Za-z0-9 ]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('role_name', '2', '50'),
      'string.max': charMinMaxLength('role_name', '2', '50'),
      'string.pattern.name': alphabetOnly('role_name')
    }),
  role_description: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('role_description', '2', '200'),
      'string.max': charMinMaxLength('role_description', '2', '200'),
      'string.pattern.name': alphabetOnly('role_description')
    }),
  screen_id: Joi.string().min(3).max(10).required()
});

/**
 * Validate role data before create.
 * @param {Object} payload - object that contains role data.
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
  role_code: Joi.string()
    .pattern(/^[A-Za-z0-9]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.min': charMinMaxLength('role_code', '2', '10'),
      'string.max': charMinMaxLength('role_code', '2', '10'),
      'string.pattern.name': alphabetOnly('role_code')
    }),
  role_name: Joi.string()
    .pattern(/^[A-Za-z0-9 ]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('role_name', '2', '50'),
      'string.max': charMinMaxLength('role_name', '2', '50'),
      'string.pattern.name': alphabetOnly('role_name')
    }),
  role_description: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('role_description', '2', '200'),
      'string.max': charMinMaxLength('role_description', '2', '200'),
      'string.pattern.name': alphabetOnly('role_description')
    }),
});

/**
 * Validate role data before update.
 * @param {Object} payload - object that contains role data.
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

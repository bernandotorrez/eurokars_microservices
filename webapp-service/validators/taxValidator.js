const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  tax_description: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_description', '2', '200'),
      'string.max': charMinMaxLength('tax_description', '2', '200'),
      'string.pattern.name': alphabetOnly('tax_description')
    }),
  tax_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_code', '2', '10'),
      'string.max': charMinMaxLength('tax_code', '2', '10'),
      'string.pattern.name': alphabetOnly('tax_code')
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
  tax_description: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_description', '2', '200'),
      'string.max': charMinMaxLength('tax_description', '2', '200'),
      'string.pattern.name': alphabetOnly('tax_description')
    }),
  tax_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_code', '2', '10'),
      'string.max': charMinMaxLength('tax_code', '2', '10'),
      'string.pattern.name': alphabetOnly('tax_code')
    }),
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

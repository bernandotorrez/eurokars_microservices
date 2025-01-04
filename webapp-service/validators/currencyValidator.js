const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly, fixLength } = require('../utils/validationMessage');

const createSchema = Joi.object({
  currency_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('currency_name', '2', '100'),
      'string.max': charMinMaxLength('currency_name', '2', '100'),
      'string.pattern.name': alphabetOnly('currency_name')
    }),
  currency_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(3)
    .required()
    .messages({
      'string.min': fixLength('currency_code', '3'),
      'string.max': fixLength('currency_code', '3'),
      'string.pattern.name': alphabetOnly('currency_code')
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
  currency_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('currency_name', '2', '100'),
      'string.max': charMinMaxLength('currency_name', '2', '100'),
      'string.pattern.name': alphabetOnly('currency_name')
    }),
  currency_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(3)
    .max(3)
    .required()
    .messages({
      'string.min': fixLength('currency_code', '3'),
      'string.max': fixLength('currency_code', '3'),
      'string.pattern.name': alphabetOnly('currency_code')
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

const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly, fixLength, numericOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  bank_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('bank', '2', '100'),
      'string.max': charMinMaxLength('bank', '2', '100'),
      'string.pattern.name': alphabetOnly('bank')
    }),
  local_code: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(3)
    .max(3)
    .required()
    .messages({
      'string.min': fixLength('local_code', '3'),
      'string.max': fixLength('local_code', '3'),
      'string.pattern.name': numericOnly('local_code')
    }),
  swift_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(8)
    .max(8)
    .required()
    .messages({
      'string.min': fixLength('swift_code', '8'),
      'string.max': fixLength('swift_code', '8'),
      'string.pattern.name': alphabetOnly('swift_code')
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
  bank_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('bank', '2', '100'),
      'string.max': charMinMaxLength('bank', '2', '100'),
      'string.pattern.name': alphabetOnly('bank_name')
    }),
  local_code: Joi.string()
    .pattern(/^\d+$/, 'Number Only')
    .min(3)
    .max(3)
    .required()
    .messages({
      'string.min': fixLength('local_code', '3'),
      'string.max': fixLength('local_code', '3'),
      'string.pattern.name': numericOnly('local_code')
    }),
  swift_code: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(8)
    .max(8)
    .required()
    .messages({
      'string.min': fixLength('swift_code', '8'),
      'string.max': fixLength('swift_code', '8'),
      'string.pattern.name': alphabetOnly('swift_code')
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

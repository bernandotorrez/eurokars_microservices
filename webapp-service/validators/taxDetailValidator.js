const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const {
  charMinMaxLength,
  numericOnly
} = require('../utils/validationMessage');

const createSchema = Joi.object({
  tax_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  tax_detail_description: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_detail_description', '3', '100'),
      'string.max': charMinMaxLength('tax_detail_description', '3', '100')
    }),
  percentage: Joi.string()
    .pattern(/^[0-9]+(\.[0-9]{1,2})?$/, 'Numeric Only')
    .min(1)
    .max(5)
    .required()
    .messages({
      'string.min': charMinMaxLength('percentage', '1', '3'),
      'string.max': charMinMaxLength('percentage', '1', '3'),
      'string.pattern.name': `${numericOnly('percentage')} and Use dot (.) as Decimal`
    }),
  screen_id: Joi.string().min(3).max(10).required()
});

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
  tax_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  tax_detail_description: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('tax_detail_description', '3', '100'),
      'string.max': charMinMaxLength('tax_detail_description', '3', '100')
    }),
  percentage: Joi.string()
    .pattern(/^[0-9]+(\.[0-9]{1,2})?$/, 'Numeric Only')
    .min(1)
    .max(5)
    .required()
    .messages({
      'string.min': charMinMaxLength('percentage', '1', '3'),
      'string.max': charMinMaxLength('percentage', '1', '3'),
      'string.pattern.name': `${numericOnly('percentage')} and Use dot (.) as Decimal`
    }),
});

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

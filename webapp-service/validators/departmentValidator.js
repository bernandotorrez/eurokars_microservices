const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  department_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('department_name', '2', '50'),
      'string.max': charMinMaxLength('department_name', '2', '50'),
      'string.pattern.name': alphabetOnly('department_name')
    }),
  department_code: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('department_code', '2', '8'),
      'string.max': charMinMaxLength('department_code', '2', '8')
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
  department_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('department_name', '2', '50'),
      'string.max': charMinMaxLength('department_name', '2', '50'),
      'string.pattern.name': alphabetOnly('department_name')
    }),
  department_code: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('department_code', '2', '8'),
      'string.max': charMinMaxLength('department_code', '2', '8')
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

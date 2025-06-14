const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly, empty } = require('../utils/validationMessage');

const createSchema = Joi.object({
  configuration_name: Joi.string()
    .pattern(/^[a-zA-Z0-9\s_]+$/, 'Alphabets, numbers, spaces, and underscores only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('configuration_name', '2', '200'),
      'string.max': charMinMaxLength('configuration_name', '2', '200'),
      'string.pattern.name': 'Configuration Name must be Alphabets, numbers, spaces, and underscores only'
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
    configuration_name: Joi.string()
    .pattern(/^[a-zA-Z0-9\s_]+$/, 'Alphabets, numbers, spaces, and underscores only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('configuration_name', '2', '200'),
      'string.max': charMinMaxLength('configuration_name', '2', '200'),
      'string.pattern.name': 'Configuration Name must be Alphabets, numbers, spaces, and underscores only'
    }),
    status: Joi.string()
    .valid('0', '1')
    .required()
    .messages({
      'any.only': 'Status must be "0" atau "1"',
      'any.required': empty('status')
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

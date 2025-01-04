const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly, alphabetAndUrlOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  status_app_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('status_app_name', '2', '50'),
      'string.max': charMinMaxLength('status_app_name', '2', '50'),
      'string.pattern.name': alphabetOnly('status_app_name')
    }),
  redirect_url: Joi.string()
    .pattern(/^\/[a-zA-Z]+$/, 'Must start with / and contain only alphabets')
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('redirect_url', '3', '200'),
      'string.max': charMinMaxLength('redirect_url', '3', '200'),
      'string.pattern.name': alphabetAndUrlOnly('redirect_url')
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
  status_app_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': charMinMaxLength('status_app_name', '2', '50'),
      'string.max': charMinMaxLength('status_app_name', '2', '50'),
      'string.pattern.name': alphabetOnly('status_app_name')
    }),
  redirect_url: Joi.string()
    .pattern(/^\/[a-zA-Z]+$/, 'Must start with / and contain only alphabets')
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('redirect_url', '3', '200'),
      'string.max': charMinMaxLength('redirect_url', '3', '200'),
      'string.pattern.name': alphabetAndUrlOnly('redirect_url')
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

const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly } = require('../utils/validationMessage');

const createSchema = Joi.object({
  department_id: Joi.string().min(1).max(50).required(),
  division_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('division_name', '2', '100'),
      'string.max': charMinMaxLength('division_name', '2', '100'),
      'string.pattern.name': alphabetOnly('division_name')
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
  department_id: Joi.string().min(1).max(50).required(),
  division_name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/, 'Alphabet Only')
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': charMinMaxLength('division_name', '2', '100'),
      'string.max': charMinMaxLength('division_name', '2', '100'),
      'string.pattern.name': alphabetOnly('division_name')
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

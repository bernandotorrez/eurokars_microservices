const Joi = require('@hapi/joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const departmentSchema = Joi.object({
  company: Joi.string().min(2).max(100).required(),
  company_short: Joi.string().min(2).max(3).required()
});

const create = (payload) => {
  const validationResult = departmentSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  create
};

const Joi = require('@hapi/joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const StatusAppSchema = Joi.object({
  status_app: Joi.string().min(3).max(50).required(),
  redirect_url: Joi.string().min(3).max(100).required()
});

const statusAppValidator = (payload) => {
  const validationResult = StatusAppSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  statusAppValidator
};

const Joi = require('@hapi/joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const UserSchema = Joi.object({
  username: Joi.string().min(3).required()
});

const userValidator = (payload) => {
  const validationResult = UserSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  userValidator
};

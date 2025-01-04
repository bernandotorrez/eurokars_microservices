const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const RegisterSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().min(3).required(),
  password: Joi.string().min(5).required()
});

const registerValidator = (payload) => {
  const validationResult = RegisterSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

const LoginSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(5).required()
});

const loginValidator = (payload) => {
  const validationResult = LoginSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  registerValidator,
  loginValidator
};

const Joi = require('@hapi/joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const UserStatusAppSchema = Joi.object({
  id_user: Joi.string().min(1).max(50).required(),
  id_status_app: Joi.string().min(1).max(50).required()
});

const userStatusAppValidator = (payload) => {
  const validationResult = UserStatusAppSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  userStatusAppValidator
};

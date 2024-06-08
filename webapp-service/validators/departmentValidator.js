const Joi = require('@hapi/joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const DepartmentSchema = Joi.object({
  department: Joi.string().min(2).max(50).required()
});

const departmentValidator = (payload) => {
  const validationResult = DepartmentSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  departmentValidator
};

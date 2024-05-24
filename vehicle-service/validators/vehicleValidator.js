const Joi = require('@hapi/joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const VehicleSchema = Joi.object({
  model: Joi.string().min(3).max(20).required(),
  type: Joi.string().min(3).max(20).required(),
  colour: Joi.string().min(3).max(20).required(),
  fuel: Joi.string().min(3).max(10).required(),
  chassis: Joi.string().min(3).max(20).required(),
  engine_no: Joi.string().min(3).max(20).required(),
  date_reg: Joi.date().required(),
  curr: Joi.string().min(3).max(20).required(),
  price: Joi.number().required()
});

const vehicleValidator = (payload) => {
  const validationResult = VehicleSchema.validate(payload, { abortEarly: false });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  vehicleValidator
};

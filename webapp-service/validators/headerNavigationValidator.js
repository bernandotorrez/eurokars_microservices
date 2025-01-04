const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const createSchema = Joi.object({
  parent_id: Joi.string().allow('').min(1).max(50),
  header_navigation_name: Joi.string().min(3).max(100).required(),
  sort_number: Joi.string().min(1).max(3).required(),
  url: Joi.string().min(1).max(100),
  remark: Joi.string().allow('').min(3).max(500),
  level: Joi.string().min(1).max(3).required(),
  is_other_sidebar: Joi.string().min(1).max(1).required(),
  screen_id_input: Joi.string().min(3).max(10).allow(null),
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
  parent_id: Joi.string().allow('').min(1).max(50),
  header_navigation_name: Joi.string().min(3).max(100).required(),
  sort_number: Joi.string().min(1).max(3).required(),
  url: Joi.string().min(1).max(100),
  remark: Joi.string().allow('').min(3).max(500),
  level: Joi.string().min(1).max(3).required(),
  is_other_sidebar: Joi.string().min(1).max(1).required()
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

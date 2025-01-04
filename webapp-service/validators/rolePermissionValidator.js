const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const {
  convertMessage
} = require('../utils/globalFunction');
const {
  charMinMaxLength,
  alphabetOnly
} = require('../utils/validationMessage');

const enumCan = ['0', '1'];

const createSchema = Joi.object({
  menu_group_id: Joi.string().min(1).max(50).required(),
  header_navigation_id: Joi.string().min(1).max(50).required(),
  role_id: Joi.string().min(1).max(50).required(),
  can_view: Joi.string().valid(...enumCan).required(),
  can_add: Joi.string().valid(...enumCan).required(),
  can_edit: Joi.string().valid(...enumCan).required(),
  can_delete: Joi.string().valid(...enumCan).required(),
  can_send: Joi.string().valid(...enumCan).required(),
  can_approve: Joi.string().valid(...enumCan).required(),
  can_reject: Joi.string().valid(...enumCan).required(),
  can_report: Joi.string().valid(...enumCan).required(),
  can_cancel: Joi.string().valid(...enumCan).required(),
  screen_id: Joi.string().min(3).max(10).required()
});

/**
 * Validate role data before create.
 * @param {Object} payload - object that contains role data.
 * @throws {BadRequestError} if payload is invalid.
 */
const create = (payload) => {
  const validationResult = createSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

const updateSchema = Joi.object({
  menu_group_id: Joi.string().min(1).max(50).required(),
  header_navigation_id: Joi.string().min(1).max(50).required(),
  role_id: Joi.string().min(1).max(50).required(),
  can_view: Joi.string().valid(...enumCan).required(),
  can_add: Joi.string().valid(...enumCan).required(),
  can_edit: Joi.string().valid(...enumCan).required(),
  can_delete: Joi.string().valid(...enumCan).required(),
  can_send: Joi.string().valid(...enumCan).required(),
  can_approve: Joi.string().valid(...enumCan).required(),
  can_reject: Joi.string().valid(...enumCan).required(),
  can_report: Joi.string().valid(...enumCan).required(),
  can_cancel: Joi.string().valid(...enumCan).required()
});

/**
 * Validate role data before update.
 * @param {Object} payload - object that contains role data.
 * @throws {BadRequestError} if payload is invalid.
 */
const update = (payload) => {
  const validationResult = updateSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  create,
  update
};

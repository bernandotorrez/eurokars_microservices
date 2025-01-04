const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const {
  convertMessage
} = require('../utils/globalFunction');

const createSchema = Joi.object({
  menu_group_id: Joi.string().min(1).max(50).required(),
  header_navigation_id: Joi.string().min(1).max(738).required().messages({
    'string.max': 'Maximal 20 Menu per Request'
  }),
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
  header_navigation_id: Joi.object({
    insert: Joi.string().min(1).max(738).allow('').messages({
      'string.max': 'Maximal 20 Menu per Request'
    }),
    remove: Joi.string().min(1).max(738).allow('').messages({
      'string.max': 'Maximal 20 Menu per Request'
    })
  }),
  screen_id: Joi.string().min(3).max(10).required()
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

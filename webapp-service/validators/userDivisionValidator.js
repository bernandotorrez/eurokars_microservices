const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');

const createSchema = Joi.object({
  user_id: Joi.string().min(1).max(50).required(),
  division_id: Joi.string().min(1).max(369).required().messages({
    'string.max': 'Maximal 10 ID Division per Request'
  }),
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
  division_id: Joi.object({
    insert: Joi.string().min(1).max(369).allow('').messages({
      'string.max': 'Maximal 10 ID Division per Request'
    }),
    remove: Joi.string().min(1).max(369).allow('').messages({
      'string.max': 'Maximal 10 ID Division per Request'
    })
  }),
  screen_id: Joi.string().min(3).max(10).required()
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

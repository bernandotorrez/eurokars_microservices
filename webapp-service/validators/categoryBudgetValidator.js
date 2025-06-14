const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const { convertMessage } = require('../utils/globalFunction');
const { charMinMaxLength, alphabetOnly } = require('../utils/validationMessage');

const OPEX_CAPEX_ENUM = ['OpexRoutine', 'OpexNonRoutine', 'Capex'];

const createSchema = Joi.object({
  budget_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  sub_coa_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  business_line_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  sub_business_line_1_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  sub_business_line_2_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  category_budget_name: Joi.string()
    .pattern(/^[A-Za-z0-9 ]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_name', '2', '50'),
      'string.max': charMinMaxLength('coa_name', '2', '50'),
      'string.pattern.name': alphabetOnly('coa_name')
    }),
  total_category_budget: Joi.string()
    .pattern(/^\d{6,20}(\.\d+)?$/, 'Total Budget must be a decimal number 6 to 20 digits before the decimal point') // Matches 1 to 20 digits before the decimal and optional decimal part
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.min': charMinMaxLength('total_budget', '6', '20'),
      'string.max': charMinMaxLength('total_budget', '6', '20'),
      'string.pattern.name': `Total Budget must be a decimal number 6 to 20 digits before the decimal point`
    }),
  opex_capex: Joi.string()
    .valid(...OPEX_CAPEX_ENUM)
    .required()
    .messages({
      'any.only': 'Opex Capex must be OpexRoutine, OpexNonRoutine or Capex',
    }),
  screen_id: Joi.string().min(3).max(10).required()
});

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
  budget_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  sub_coa_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  business_line_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  sub_business_line_1_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  sub_business_line_2_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  category_budget_name: Joi.string()
    .pattern(/^[A-Za-z0-9 ]+$/, 'Alphabet & Number Only')
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': charMinMaxLength('coa_name', '2', '50'),
      'string.max': charMinMaxLength('coa_name', '2', '50'),
      'string.pattern.name': alphabetOnly('coa_name')
    }),
  total_category_budget: Joi.string()
    .pattern(/^\d{6,20}(\.\d+)?$/, 'Total Budget must be a decimal number 6 to 20 digits before the decimal point') // Matches 1 to 20 digits before the decimal and optional decimal part
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.min': charMinMaxLength('total_budget', '6', '20'),
      'string.max': charMinMaxLength('total_budget', '6', '20'),
      'string.pattern.name': `Total Budget must be a decimal number 6 to 20 digits before the decimal point`
    }),
  opex_capex: Joi.string()
    .valid(...OPEX_CAPEX_ENUM)
    .required()
    .messages({
      'any.only': 'Opex Capex must be OpexRoutine, OpexNonRoutine or Capex',
    }),
});

const update = (payload) => {
  const validationResult = updateSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

const generateCodeSchema = Joi.object({
  budget_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
});

const generateCode = (payload) => {
  const validationResult = generateCodeSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

module.exports = {
  create,
  update,
  generateCode
};

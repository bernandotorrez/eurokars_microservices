const Joi = require('joi');
const BadRequestError = require('../exceptions/BadRequestError');
const {
  convertMessage
} = require('../utils/globalFunction');
const {
  charMinMaxLength,
  fixLength,
  numericOnly
} = require('../utils/validationMessage');

const createSchema = Joi.object({
  company_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  brand_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  branch_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  department_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  // total_budget: Joi.string()
  //   .pattern(/^\d{6,20}(\.\d+)?$/, 'Total Budget must be a decimal number 6 to 20 digits before the decimal point') // Matches 1 to 20 digits before the decimal and optional decimal part
  //   .min(6)
  //   .max(20)
  //   .required()
  //   .messages({
  //     'string.min': charMinMaxLength('total_budget', '6', '20'),
  //     'string.max': charMinMaxLength('total_budget', '6', '20'),
  //     'string.pattern.name': `Total Budget must be a decimal number 6 to 20 digits before the decimal point`
  //   }),
  year: Joi.string()
    .pattern(/^\d{4}$/)
    .min(4)
    .max(4)
    .required()
    .messages({
      'string.min': fixLength('year', '4', '4'),
      'string.max': fixLength('year', '4', '4'),
      'string.pattern.name': numericOnly('year')
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

// Bulk
const createBulkSchema = Joi.object({
  items: Joi.array()
    .items({
      company_id: Joi.string()
        .min(1)
        .max(50)
        .required(),
      brand_id: Joi.string()
        .min(1)
        .max(50)
        .required(),
      branch_id: Joi.string()
        .min(1)
        .max(50)
        .required(),
      department_id: Joi.string()
        .min(1)
        .max(50)
        .required(),
      year: Joi.string()
        .pattern(/^\d{4}$/, 'Numeric Only')
        .min(4)
        .max(4)
        .required()
        .messages({
          'string.min': fixLength('year', '4', '4'),
          'string.max': fixLength('year', '4', '4'),
          'string.pattern.name': numericOnly('year')
        }),
    })
    .min(1)
    .required(),
  screen_id: Joi.string().min(3).max(10).required()
});

const createBulk = (payload) => {
  const validationResult = createBulkSchema.validate(payload, {
    abortEarly: false
  });

  if (validationResult.error) {
    const error = JSON.stringify(convertMessage(validationResult.error.details));
    throw new BadRequestError(error);
  }
};

const updateSchema = Joi.object({
  company_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  brand_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  branch_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  department_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  year: Joi.string()
    .pattern(/^\d{4}$/)
    .min(4)
    .max(4)
    .required()
    .messages({
      'string.min': fixLength('year', '4', '4'),
      'string.max': fixLength('year', '4', '4'),
      'string.pattern.name': numericOnly('year')
    })
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
  company_id: Joi.string()
    .min(1)
    .max(50)
    .required(),
  year: Joi.string()
    .min(4)
    .max(4)
    .required()
    .messages({
      'string.min': fixLength('year', '4', '4'),
      'string.max': fixLength('year', '4', '4'),
      'string.pattern.name': numericOnly('year')
    }),
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
  generateCode,
  createBulk
};

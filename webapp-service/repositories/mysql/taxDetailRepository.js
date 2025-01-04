const { TaxDetail, Tax, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class TaxDetailRepository {
  constructor() {
    this._model = TaxDetail;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'tax_id',
      'tax_detail_description',
      'percentage',
      '$tax.tax_description$',
      '$tax.tax_code$',
      '$tax.tax_flag$',
      'created_date'
    ];
    this._includeModels = [{
      model: Tax.scope('withoutTemplateFields'),
      as: 'tax',
      required: true
    }];
  }

  async getAll({
    search,
    sort,
    page,
    taxCode,
    taxFlag
  }) {
    const querySql = {};

    // Sorting logic
    if (sort && sort.value && sort.sorting) {
      const sortField = sort.value;
      const sortDirection = sort.sorting.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (this._searchFields.includes(sortField)) {
        // Handle sorting with related fields
        if (sortField.startsWith('$')) {
          const cleanField = sortField.replace(/\$/g, '').split('.'); // Remove '$' and split by '.'
          querySql.order = [
            [...cleanField, sortDirection]
          ];
        } else {
          // Handle direct sorting on the main model
          querySql.order = [
            [sortField, sortDirection]
          ];
        }
      } else {
        // Fallback to default sorting
        querySql.order = [
          [this._primaryKey, this._sort]
        ];
      }
    } else {
      // Default sorting
      querySql.order = [
        [this._primaryKey, this._sort]
      ];
    }

    // Pagination logic
    if (search !== 'all') {
      if (page !== '' && typeof page !== 'undefined') {
        let { limit, number } = page;
        limit = limit ? parseInt(limit) : this._limit;
        number = number ? parseInt(number) : this._number;

        if (limit !== '' && typeof limit !== 'undefined') {
          querySql.limit = limit;
        }

        if (number !== '' && typeof number !== 'undefined') {
          querySql.offset = number === 0 ? 0 : parseInt((number * limit) - limit);
        }
      } else {
        querySql.limit = this._limit;
        querySql.offset = this._number;
      }

      // Search logic
      if (search !== '' && typeof search !== 'undefined') {
        querySql.where = {
          [Op.or]: this._searchFields.map(field => ({
            [field]: {
              [Op.substring]: search
            }
          }))
        };
      }
    }

    // Get Tax Detail by Tax Code
    if (taxCode !== '' && typeof taxCode !== 'undefined') {
      querySql.where = {
        '$tax.tax_code$': taxCode
      }
    }

    // Get Tax Detail by Tax Flag
    if (taxFlag !== '' && typeof taxFlag !== 'undefined') {
      querySql.where = {
        '$tax.tax_flag$': taxFlag
      }
    }

    // Include related models
    querySql.include = this._includeModels;

    // Fetch data
    const data = await this._model.findAndCountAll(querySql);

    return data;
  }


  async getOne(id = '') {
    if (id === '') throw new BadRequestError('ID Tax Detail Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const taxDetail = await this._model.findOne(querySql);

    if (!taxDetail) throw new NotFoundError('Tax Detail not found');

    return taxDetail;
  }

  async add(userId, params) {
    const {
      tax_id: taxId,
      tax_detail_description: taxDetailDescription,
      percentage,
      screen_id: screenId
    } = params;

    const checkDuplicate = await this.checkDuplicate(taxId, percentage);

    if (checkDuplicate >= 1) throw new ConflictError(`Tax already Created`);

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        tax_id: taxId,
        tax_detail_description: taxDetailDescription,
        percentage,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Tax Detail Failed');
    }
  }

  async checkDuplicate(taxId, percentage) {
    const check = await this._model.findAll({
      where: {
        tax_id: taxId,
        percentage
      }
    });

    return check.length;
  }

  async checkDuplicateEdit(id, taxId, percentage) {
    const check = await this._model.findAll({
      where: {
        tax_id: taxId,
        percentage,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update(id, userId, params) {
    // Check Data if Exist
    await this.getOne(id);

    const {
      tax_id: taxId,
      tax_detail_description: taxDetailDescription,
      percentage,
    } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, taxId, percentage);

    if (checkDuplicate >= 1) throw new ConflictError(`Tax already Created`);

    try {
      return await this._model.update({
        tax_id: taxId,
        tax_detail_description: taxDetailDescription,
        percentage,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update Tax Detail Failed');
    }
  }

  async delete(id, userId) {
    // await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        is_active: '0',
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Delete Tax Detail Failed');
    }
  }
}

module.exports = new TaxDetailRepository();

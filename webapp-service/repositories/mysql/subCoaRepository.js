const { SubCoa, Coa, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class SubCoaRepository {
  constructor() {
    this._model = SubCoa;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'coa_id',
      'sub_coa_code',
      'sub_coa_description',
      '$coa.coa_description$',
      '$coa.coa_code$',
      'created_date'
    ];
    this._includeModels = [{
      model: Coa.scope('withoutTemplateFields'),
      as: 'coa',
      required: true
    }];
  }

  async getAll({
    search,
    sort,
    page,
    coaCode
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

    // Get Sub COA by Coa Code
    if (coaCode !== '' && typeof coaCode !== 'undefined') {
      querySql.where = {
        '$coa.coa_code$': coaCode
      }
    }

    // Include related models
    querySql.include = this._includeModels;

    // Fetch data
    const data = await this._model.findAndCountAll(querySql);

    return data;
  }


  async getOne(id = '') {
    if (id === '') throw new BadRequestError('ID Sub COA Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const coaDetail = await this._model.findOne(querySql);

    if (!coaDetail) throw new NotFoundError('Sub COA not found');

    return coaDetail;
  }

  async add(userId, params) {
    const {
      coa_id: coaId,
      sub_coa_code: subCoaCode,
      sub_coa_name: subCoaName,
      sub_coa_description: subCoaDescription,
      screen_id: screenId
    } = params;

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_sub_coa(:userId, :coaId, :subCoaCode, :subCoaName, :subCoaDescription, :screenId, :uniqueId);',
        {
          replacements: { userId, coaId, subCoaCode, subCoaName, subCoaDescription, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          sub_coa_id,
          coa_id,
          sub_coa_name,
          sub_coa_code,
          sub_coa_description,
          created_by,
          created_date,
          unique_id
        } = results;

        const data = {
          sub_coa_id,
          coa_id,
          sub_coa_name,
          sub_coa_code,
          sub_coa_description,
          created_by,
          created_date,
          unique_id
        };

        // Handle error codes
        if (return_code !== 200) {
          if (return_code === 409) {
            throw new ConflictError(return_message);
          } else if (return_code === 404) {
            throw new NotFoundError(return_message);
          } else if (return_code === 400) {
            throw new BadRequestError(return_message);
          } else {
            throw new UnprocessableEntityError(return_message);
          }
        }

        // Return the data
        return data;
      } else {
        throw new UnprocessableEntityError('Add Sub COA Failed');
      }
    } catch (error) {
      // Re-throw custom errors
      if (error instanceof ConflictError ||
          error instanceof BadRequestError ||
          error instanceof NotFoundError ||
          error instanceof UnprocessableEntityError) {
        throw error;
      }
      // For any other errors
      console.error('Error details:', error);
      throw new UnprocessableEntityError('Add Sub COA Failed');
    }
  }

  async checkDuplicate(coaId, subCoaCode, subCoaName) {
    const check = await this._model.findAll({
      where: {
        coa_id: coaId,
        sub_coa_code: subCoaCode,
        sub_coa_name: subCoaName
      }
    });

    return check.length;
  }

  async checkDuplicateEdit(id, coaId, subCoaCode, subCoaName) {
    const check = await this._model.findAll({
      where: {
        coa_id: coaId,
        sub_coa_code: subCoaCode,
        sub_coa_name: subCoaName,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update(id, userId, params) {
    const {
      coa_id: coaId,
      sub_coa_code: subCoaCode,
      sub_coa_name: subCoaName,
      sub_coa_description: subCoaDescription
    } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_sub_coa(:userId, :coaId, :subCoaCode, :subCoaName, :subCoaDescription, :uniqueId);',
        {
          replacements: { userId, coaId, subCoaCode, subCoaName, subCoaDescription, uniqueId: id },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          unique_id
        } = results;

        // Handle error codes
        if (return_code !== 200) {
          if (return_code === 409) {
            throw new ConflictError(return_message);
          } else if (return_code === 404) {
            throw new NotFoundError(return_message);
          } else if (return_code === 400) {
            throw new BadRequestError(return_message);
          } else {
            throw new UnprocessableEntityError(return_message);
          }
        }

        // Return the data
        return unique_id;
      } else {
        throw new UnprocessableEntityError('Update Sub COA Failed');
      }
    } catch (error) {
      // Re-throw custom errors
      if (error instanceof ConflictError ||
          error instanceof BadRequestError ||
          error instanceof NotFoundError ||
          error instanceof UnprocessableEntityError) {
        throw error;
      }
      // For any other errors
      console.error('Error details:', error);
      throw new UnprocessableEntityError('Update Sub COA Failed');
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
      throw new UnprocessableEntityError('Delete Sub COA Failed');
    }
  }
}

module.exports = new SubCoaRepository();

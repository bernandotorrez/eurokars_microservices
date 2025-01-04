const { Company, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class CompanyRepository {
  constructor () {
    this._model = Company;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [this._primaryKey, 'company_name', 'company_code', 'tax_id', 'created_date'];
  }

  async getAll ({ search, sort, page }) {
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

    // pagination
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

      // search
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

    // const count = await this._model.count({
    //   attributes: [
    //     [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
    //   ]
    // });

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Company Required');

    const data = await this._model.findOne({ where: { unique_id: id } });

    if (!data) throw new NotFoundError('Company not found');

    return data;
  }

  async add (userId, params) {
    const { company_name: companyName, company_code: companyCode, tax_id: taxId, screen_id: screenId } = params;

    const checkDuplicate = await this.checkDuplicate(companyName, companyCode, taxId);

    if (checkDuplicate >= 1) throw new ConflictError(`${companyName} - ${companyCode} - ${taxId} already Created`);

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        company_name: companyName,
        company_code: companyCode,
        tax_id: taxId,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Company Failed');
    }
  }

  async checkDuplicate (companyName, companyCode, taxId) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { company_name: companyName },
          { company_code: companyCode },
          { tax_id: taxId }
        ]
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, companyName, companyCode, taxId) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { company_name: companyName },
          { company_code: companyCode },
          { tax_id: taxId }
        ],
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (id, userId, params) {
    // Check Data if Exist
    await this.getOne(id);

    const { company_name: companyName, company_code: companyCode, tax_id: taxId } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, companyName, companyCode, taxId);

    if (checkDuplicate >= 1) throw new ConflictError(`${companyName} - ${companyCode} - ${taxId} already Created`);

    try {
      return await this._model.update({
        company_name: companyName,
        company_code: companyCode,
        tax_id: taxId,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update Company Failed');
    }
  }

  async delete (id, userId) {
    // await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        is_active: '0',
        updated_by: userId,
        updated_date: timeHis()
      },
      {
        where: {
          unique_id: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Delete Company Failed');
    }
  }
}

module.exports = new CompanyRepository();

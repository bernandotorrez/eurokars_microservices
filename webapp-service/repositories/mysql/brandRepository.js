const { Brand, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class BrandRepository {
  constructor () {
    this._model = Brand;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [this._primaryKey, 'brand_name', 'created_date'];
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
    if (id === '') throw new BadRequestError('ID Brand Required');

    const data = await this._model.findOne({ where: { unique_id: id } });

    if (!data) throw new NotFoundError('Brand not found');

    return data;
  }

  async add (userId, params) {
    const { brand_name: brandName, screen_id: screenId } = params;

    const checkDuplicate = await this.checkDuplicate(brandName);

    if (checkDuplicate >= 1) throw new ConflictError(`${brandName} already Created`);

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        brand_name: brandName,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Brand Failed');
    }
  }

  async checkDuplicate (brandName) {
    const check = await this._model.findAll({
      where: {
        brand_name: brandName
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, brandName) {
    const check = await this._model.findAll({
      where: {
        brand_name: brandName,
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

    const { brand_name: brandName } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, brandName);

    if (checkDuplicate >= 1) throw new ConflictError(`${brandName} already Created`);

    try {
      return await this._model.update({
        brand_name: brandName,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update Brand Failed');
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
      throw new UnprocessableEntityError('Delete Brand Failed');
    }
  }
}

module.exports = new BrandRepository();
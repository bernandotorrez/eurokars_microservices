const {
  Branch,
  City,
  Province,
  sequelize
} = require('../../models');
const {
  Op
} = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const {
  timeHis
} = require('../../utils/globalFunction');
const {
  v4: uuidv4
} = require('uuid');

class BranchRepository {
  constructor() {
    this._model = Branch;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'city_id',
      'branch_name',
      'address',
      'phone',
      'fax',
      'email',
      'branch_code',
      '$city.city_name$',
      '$city.province.province_name$',
      'created_date'
    ];
    this._includeModels = [{
      model: City.scope('withoutTemplateFields'),
      as: 'city',
      required: true,
      include: [{
        model: Province.scope('withoutTemplateFields'),
        as: 'province',
        required: true
      }]
    }];
  }

  async getAll({
    search,
    sort,
    page
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

    // Include related models
    querySql.include = this._includeModels;

    // Fetch data
    const data = await this._model.findAndCountAll(querySql);

    return data;
  }


  async getOne(id = '') {
    if (id === '') throw new BadRequestError('ID Branch Required');

    const querySql = {};

    querySql.where = {
      unique_id: id
    };
    querySql.include = this._includeModels;

    const branch = await this._model.findOne(querySql);

    if (!branch) throw new NotFoundError('Branch not found');

    return branch;
  }

  async add(userId, params) {
    const {
      city_id: cityId,
      branch_name: branchName,
      branch_code: branchCode,
      address,
      phone,
      fax,
      email,
      screen_id: screenId
    } = params;

    const checkDuplicate = await this.checkDuplicate(cityId, branchName, branchCode);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        city_id: cityId,
        branch_name: branchName,
        branch_code: branchCode,
        address,
        phone,
        fax,
        email,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Branch Failed');
    }
  }

  async checkDuplicate(cityId, branchName, branchCode) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [{
            city_id: cityId,
            branch_name: branchName
          },
          {
            branch_code: branchCode
          }
        ]
      }
    });

    return check.length;
  }

  async checkDuplicateEdit(id, cityId, branchName, branchCode) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [{
            city_id: cityId,
            branch_name: branchName
          },
          {
            branch_code: branchCode
          }
        ],
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
      city_id: cityId,
      branch_name: branchName,
      branch_code: branchCode,
      address,
      phone,
      fax,
      email
    } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, cityId, branchName, branchCode);

    if (checkDuplicate >= 1) throw new ConflictError('Branch already Created');

    try {
      return await this._model.update({
        city_id: cityId,
        branch_name: branchName,
        branch_code: branchCode,
        address,
        phone,
        fax,
        email,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update Branch Failed');
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
      throw new UnprocessableEntityError('Delete Branch Failed');
    }
  }
}

module.exports = new BranchRepository();

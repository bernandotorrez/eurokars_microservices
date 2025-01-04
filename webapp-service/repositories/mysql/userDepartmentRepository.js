const { UserDepartment, Department, User } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserDepartmentRepository {
  constructor () {
    this._model = UserDepartment;
    this._userModel = User;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._userPrimaryKey = this._userModel.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._userSortBy = this._userPrimaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'department_id',
      'user_id',
      '$department.department_name$',
      '$user.first_name$',
      '$user.last_name$',
      '$user.full_name$',
      'created_date'
    ];
    this._userSearchFields = [
      this._userPrimaryKey,
      'email',
      'first_name',
      'last_name',
      'full_name',
      'created_date'
    ];
    this._includeModels = [
      {
        model: Department.scope('withoutTemplateFields'),
        as: 'status_app',
        required: true
      },
      {
        model: User.scope('withoutTemplateFields'),
        attributes: ['email', 'full_name'],
        as: 'user',
        required: true
      }
    ];
    this._userIncludeModels = [
      {
        model: Department.scope('withoutTemplateFields'),
        as: 'department',
        required: false,
        through: {
          attributes: [],
          as: 'user_department',
          required: false
        }
      }
    ];
  }

  async getAll ({ search, sort, page }) {
    const querySql = {};

    // Sorting logic
    if (sort && sort.value && sort.sorting) {
      const sortField = sort.value;
      const sortDirection = sort.sorting.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (this._userSearchFields.includes(sortField)) {
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
          [this._userPrimaryKey, this._sort]
        ];
      }
    } else {
      // Default sorting
      querySql.order = [
        [this._userPrimaryKey, this._sort]
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
          querySql.offset = number === 0 ? 0 : parseInt(number * limit - limit);
        }
      } else {
        querySql.limit = this._limit;
        querySql.offset = this._number;
      }

      // search
      if (search !== '' && typeof search !== 'undefined') {
        querySql.where = {
          [Op.or]: this._userSearchFields.map((field) => ({
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

    querySql.distinct = true;
    querySql.col = this._userPrimaryKey;
    querySql.include = this._userIncludeModels;
    querySql.subQuery = false;

    const data = await this._userModel.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID User Department Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userStatusApp = await this._userModel.findOne(querySql);

    if (!userStatusApp) throw new NotFoundError('User Department not found');

    return userStatusApp;
  }

  async getOneUser (id = '') {
    if (id === '') throw new BadRequestError('User Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userStatusApp = await this._userModel.findOne(querySql);

    if (!userStatusApp) throw new NotFoundError('User not found');

    return userStatusApp;
  }

  async add (params) {
    const { department_id: arraydepartmentId, user_id: userId } = params;

    const splitdepartmentId = arraydepartmentId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const departmentId of splitdepartmentId) {
      const checkDuplicate = await this.checkDuplicate(departmentId, userId);

      if (checkDuplicate >= 1) {
        arrayDuplicated.push(departmentId);
      } else {
        try {
          await this._model.create({
            [this._primaryKey]: uuidv4().toString(),
            department_id: departmentId,
            user_id: userId,
            created_date: timeHis()
          });

          arraySuccess.push(departmentId);
        } catch (error) {
          arrayFailed.push(departmentId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (departmentId, userId) {
    const check = await this._model.findAll({
      where: {
        department_id: departmentId,
        user_id: userId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, departmentId, userId) {
    const check = await this._model.findAll({
      where: {
        department_id: departmentId,
        user_id: userId,
        [this._primaryKey]: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (userId, params) {
    // Check Data if Exist
    await this.getOneUser(userId);

    const { department_id: departmentId } = params;
    const { insert, remove } = departmentId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const departmentId of splitInsert) {
        const checkDuplicate = await this.checkDuplicate(departmentId, userId);

        if (checkDuplicate >= 1) {
          arrayDuplicated.push(departmentId);
        } else {
          try {
            await this._model.create({
              [this._primaryKey]: uuidv4().toString(),
              department_id: departmentId,
              user_id: userId,
              created_date: timeHis()
            });

            arraySuccess.push(departmentId);
          } catch (error) {
            arrayFailed.push(departmentId);
          }
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const departmentId of splitRemove) {
        try {
          const update = await this._model.update({
            is_active: '0'
          },
          {
            where: {
              department_id: departmentId,
              user_id: userId,
              is_active: '1'
            }
          });

          if (update[0] === 1) {
            arraySuccess.push(departmentId);
          } else {
            arrayFailed.push(departmentId);
          }
        } catch (error) {
          arrayFailed.push(departmentId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async delete (id) {
    // await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        is_active: '0'
      },
      {
        where: {
          [this._primaryKey]: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Delete User Department Failed');
    }
  }
}

module.exports = new UserDepartmentRepository();

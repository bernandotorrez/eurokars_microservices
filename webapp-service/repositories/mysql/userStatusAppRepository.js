const { UserStatusApp, StatusApp, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserStatusAppRepository {
  constructor () {
    this._model = UserStatusApp;
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
      'status_app_id',
      'user_id',
      '$status_app.status_app_name$',
      '$status_app.redirect_url$',
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
      '$user_status_app.status_app.status_app_name$',
      '$user_status_app.status_app.redirect_url$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: StatusApp.scope('withoutTemplateFields'),
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
        model: UserStatusApp.scope('withoutTemplateFields'),
        as: 'user_status_app',
        include: {
          model: StatusApp.scope('withoutTemplateFields'),
          as: 'status_app',
          required: true
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

    querySql.distinct = true;
    querySql.col = this._userPrimaryKey;
    querySql.include = this._userIncludeModels;
    querySql.subQuery = false;

    const data = await this._userModel.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID User Status App Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userStatusApp = await this._userModel.findOne(querySql);

    if (!userStatusApp) throw new NotFoundError('User Status App not found');

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

  async add (oid, params) {
    const { status_app_id: arrayStatusAppId, user_id: userId, screen_id: screenId } = params;

    const splitstatusAppId = arrayStatusAppId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const statusAppId of splitstatusAppId) {
      const checkDuplicate = await this.checkDuplicate(statusAppId, userId);

      const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

      if (checkDuplicate >= 1) {
        arrayDuplicated.push(statusAppId);
      } else {
        try {
          await this._model.create({
            [this._primaryKey]: generateId[0][0].generated_id,
            status_app_id: statusAppId,
            user_id: userId,
            created_by: oid,
            created_date: timeHis(),
            unique_id: uuidv4().toString()
          });

          arraySuccess.push(statusAppId);
        } catch (error) {
          arrayFailed.push(statusAppId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (statusAppId, userId) {
    const check = await this._model.findAll({
      where: {
        status_app_id: statusAppId,
        user_id: userId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, statusAppId, userId) {
    const check = await this._model.findAll({
      where: {
        status_app_id: statusAppId,
        user_id: userId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (userId, oid, params) {
    // Check Data if Exist
    await this.getOneUser(userId);

    const { status_app_id: statusAppId, screen_id: screenId } = params;
    const { insert, remove } = statusAppId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const statusAppId of splitInsert) {
        const checkDuplicate = await this.checkDuplicate(statusAppId, userId);

        const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

        if (checkDuplicate >= 1) {
          arrayDuplicated.push(statusAppId);
        } else {
          try {
            await this._model.create({
              [this._primaryKey]: generateId[0][0].generated_id,
              status_app_id: statusAppId,
              user_id: userId,
              created_by: oid,
              created_date: timeHis(),
              unique_id: uuidv4().toString()
            });

            arraySuccess.push(statusAppId);
          } catch (error) {
            arrayFailed.push(statusAppId);
          }
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const statusAppId of splitRemove) {
        try {
          const update = await this._model.update({
            is_active: '0',
            updated_by: oid,
            updated_date: timeHis()
          },
          {
            where: {
              status_app_id: statusAppId,
              user_id: userId,
              is_active: '1'
            }
          });

          if (update[0] === 1) {
            arraySuccess.push(statusAppId);
          } else {
            arrayFailed.push(statusAppId);
          }
        } catch (error) {
          arrayFailed.push(statusAppId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
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
      throw new UnprocessableEntityError('Delete User Status App Failed');
    }
  }
}

module.exports = new UserStatusAppRepository();

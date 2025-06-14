const { UserDivision, Division, Department, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserDivisionRepository {
  constructor () {
    this._model = UserDivision;
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
      'division_id',
      'user_id',
      '$division.division_name$',
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
      '$user_division.division.division_name$',
      '$user_division.division.department.department_name$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: Division.scope('withoutTemplateFields'),
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
        model: UserDivision.scope('withoutTemplateFields'),
        as: 'user_division',
        include: {
          model: Division.scope('withoutTemplateFields'),
          as: 'division',
          required: true,
          include: {
            model: Department.scope('withoutTemplateFields'),
            as: 'department',
            required: true
          }
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
    if (id === '') throw new BadRequestError('ID User Division Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userStatusApp = await this._userModel.findOne(querySql);

    if (!userStatusApp) throw new NotFoundError('User Division not found');

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
    const { division_id: arrayDivisionId, user_id: userId, screen_id: screenId } = params;

    const splitdivisionId = arrayDivisionId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const divisionId of splitdivisionId) {
      // Call SP
      const [results] = await sequelize.query(
        'CALL sp_add_ms_user_division(:oid, :userId, :divisionId, :screenId, :uniqueId);',
        {
          replacements: { oid, userId, divisionId, screenId, uniqueId: uuidv4().toString() },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message
        } = results;

        // Handle error codes
        if (return_code !== 200) {
          if (return_code === 409) {
            arrayDuplicated.push(divisionId);
          } else if (return_code === 404) {
            arrayFailed.push(divisionId);
          } else if (return_code === 400) {
            arrayFailed.push(divisionId);
          } else {
            arrayFailed.push(divisionId);
          }
        } else {
          // Return the data
          arraySuccess.push(divisionId);
        }
      } else {
        arrayFailed.push(divisionId);
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (divisionId, userId) {
    const check = await this._model.findAll({
      where: {
        division_id: divisionId,
        user_id: userId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, divisionId, userId) {
    const check = await this._model.findAll({
      where: {
        division_id: divisionId,
        user_id: userId,
        [this._primaryKey]: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (userId, oid, params) {
    const { division_id: divisionId, screen_id: screenId } = params;
    const { insert, remove } = divisionId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const divisionId of splitInsert) {
        // Call SP
        const [results] = await sequelize.query(
          'CALL sp_add_ms_user_division(:oid, :userId, :divisionId, :screenId, :uniqueId);',
          {
            replacements: { oid, userId, divisionId, screenId, uniqueId: uuidv4().toString() },
            type: sequelize.QueryTypes.RAW
          }
        );

        // Check if results exist
        if (results) {
          const {
            return_code,
            return_message
          } = results;

          // Handle error codes
          if (return_code !== 200) {
            if (return_code === 409) {
              arrayDuplicated.push(divisionId);
            } else if (return_code === 404) {
              arrayFailed.push(divisionId);
            } else if (return_code === 400) {
              arrayFailed.push(divisionId);
            } else {
              arrayFailed.push(divisionId);
            }
          } else {
            // Return the data
            arraySuccess.push(divisionId);
          }
        } else {
          arrayFailed.push(divisionId);
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const divisionId of splitRemove) {
        try {
          const [results] = await sequelize.query(
            'CALL sp_update_ms_user_division(:oid, :userId, :divisionId);',
            {
              replacements: { oid, userId, divisionId },
              type: sequelize.QueryTypes.RAW
            }
          );

          // Check if results exist
          if (results) {
            const {
              return_code,
              return_message
            } = results;

            // Handle error codes
            if (return_code !== 200) {
              if (return_code === 409) {
                arrayDuplicated.push(divisionId);
              } else if (return_code === 404) {
                arrayFailed.push(divisionId);
              } else if (return_code === 400) {
                arrayFailed.push(divisionId);
              } else {
                arrayFailed.push(divisionId);
              }
            } else {
              // Return the data
              arraySuccess.push(divisionId);
            }
          } else {
            arrayFailed.push(divisionId);
          }
        } catch (error) {
          arrayFailed.push(divisionId);
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
      throw new UnprocessableEntityError('Delete User Division Failed');
    }
  }
}

module.exports = new UserDivisionRepository();

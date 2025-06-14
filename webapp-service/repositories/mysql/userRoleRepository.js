const { UserRole, Role, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserRoleRepository {
  constructor () {
    this._model = UserRole;
    this._userModel = User;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._userPrimaryKey = this._userModel.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._userSortBy = this._userPrimaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._userSearchFields = [
      this._userPrimaryKey,
      'email',
      'first_name',
      'last_name',
      'full_name',
      '$user_role.role.role_code$',
      '$user_role.role.role_name$',
      '$user_role.role.role_description$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: Role.scope('withoutTemplateFields'),
        as: 'role',
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
        model: UserRole.scope('withoutTemplateFields'),
        as: 'user_role',
        include: {
          model: Role.scope('withoutTemplateFields'),
          as: 'role',
          required: true
        }
      }
    ];
  }

  /**
   * Retrieve all user roles.
   *
   * @param {Object} options - Options.
   * @param {string} [options.search] - Search term.
   * @param {Object} [options.sort] - Sort options.
   * @param {string} options.sort.value - Sort field.
   * @param {string} options.sort.sorting - Sort direction.
   * @param {Object} [options.page] - Pagination options.
   * @param {number} options.page.limit - Page size.
   * @param {number} options.page.number - Page number.
   *
   * @return {Promise<Object>} - Promise with count and rows.
   */
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

/**
 * Retrieve one user role by ID.
 *
 * @param {string} [id] - ID of the user role.
 *
 * @return {Promise<Object>} - Promise with one user role.
 *
 * @throws {BadRequestError} - If id is empty.
 * @throws {NotFoundError} - If user role not found.
 */
  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID User Role Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userRole = await this._userModel.findOne(querySql);

    if (!userRole) throw new NotFoundError('User Role not found');

    return userRole;
  }

  /**
   * Retrieve one user role by user ID.
   *
   * @param {string} [id] - ID of the user.
   *
   * @return {Promise<Object>} - Promise with one user role.
   *
   * @throws {BadRequestError} - If id is empty.
   * @throws {NotFoundError} - If user not found.
   */
  async getOneUser (id = '') {
    if (id === '') throw new BadRequestError('User Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userRole = await this._userModel.findOne(querySql);

    if (!userRole) throw new NotFoundError('User not found');

    return userRole;
  }

  /**
   * Add new user role.
   *
   * @param {string} oid - ID of user who add the user role.
   * @param {Object} params - Data to be added to the user role.
   * @param {string} params.role_id - Role IDs to be added.
   * @param {string} params.user_id - User ID of the user role.
   * @param {string} params.screen_id - Screen ID of the user role.
   *
   * @return {Promise<Object>} - Promise with the result of add user role.
   *
   * @throws {UnprocessableEntityError} - If failed to add user role.
   */
  async add (oid, params) {
    const { role_id: arrayRoleId, user_id: userId, screen_id: screenId } = params;

    const splitRoleId = arrayRoleId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const roleId of splitRoleId) {
      // Call SP
      const [results] = await sequelize.query(
        'CALL sp_add_ms_user_role(:oid, :userId, :roleId, :screenId, :uniqueId);',
        {
          replacements: { oid, userId, roleId, screenId, uniqueId: uuidv4().toString() },
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
            arrayDuplicated.push(roleId);
          } else if (return_code === 404) {
            arrayFailed.push(roleId);
          } else if (return_code === 400) {
            arrayFailed.push(roleId);
          } else {
            arrayFailed.push(roleId);
          }
        } else {
          // Return the data
          arraySuccess.push(roleId);
        }
      } else {
        arrayFailed.push(roleId);
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  /**
   * Check if user role is already existed in the database.
   *
   * @param {string} roleId - Role ID of the user role.
   * @param {string} userId - User ID of the user role.
   *
   * @return {Promise<number>} - Promise with the number of existing user role.
   */
  async checkDuplicate (roleId, userId) {
    const check = await this._model.findAll({
      where: {
        role_id: roleId,
        user_id: userId
      }
    });

    return check.length;
  }

/**
 * Check if a user role with a specific roleId and userId exists in the database,
 * excluding the given unique id.
 *
 * @param {string} id - Unique id to exclude from the check.
 * @param {string} roleId - Role ID to check for existence.
 * @param {string} userId - User ID to check for existence.
 *
 * @return {Promise<number>} - Promise with the number of existing user roles.
 */
  async checkDuplicateEdit (id, roleId, userId) {
    const check = await this._model.findAll({
      where: {
        role_id: roleId,
        user_id: userId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  /**
   * Update user roles by inserting and removing role IDs.
   *
   * @param {string} userId - ID of the user whose roles are being updated.
   * @param {string} oid - ID of the user performing the update.
   * @param {Object} params - Data containing role IDs and screen ID.
   * @param {Object} params.role_id - Object containing insert and remove lists of role IDs.
   * @param {string} params.screen_id - Screen ID for generating unique IDs.
   *
   * @return {Promise<Object>} - Promise with the result of updates categorized into success, duplicated, and failed.
   */
  async update (userId, oid, params) {
    const { role_id: roleId, screen_id: screenId } = params;
    const { insert, remove } = roleId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const roleId of splitInsert) {
        // Call SP
        const [results] = await sequelize.query(
          'CALL sp_add_ms_user_role(:oid, :userId, :roleId, :screenId, :uniqueId);',
          {
            replacements: { oid, userId, roleId, screenId, uniqueId: uuidv4().toString() },
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
              arrayDuplicated.push(roleId);
            } else if (return_code === 404) {
              arrayFailed.push(roleId);
            } else if (return_code === 400) {
              arrayFailed.push(roleId);
            } else {
              arrayFailed.push(roleId);
            }
          } else {
            // Return the data
            arraySuccess.push(roleId);
          }
        } else {
          arrayFailed.push(roleId);
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const roleId of splitRemove) {
        try {
          const [results] = await sequelize.query(
            'CALL sp_update_ms_user_role(:oid, :userId, :roleId);',
            {
              replacements: { oid, userId, roleId },
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
                arrayDuplicated.push(roleId);
              } else if (return_code === 404) {
                arrayFailed.push(roleId);
              } else if (return_code === 400) {
                arrayFailed.push(roleId);
              } else {
                arrayFailed.push(roleId);
              }
            } else {
              // Return the data
              arraySuccess.push(roleId);
            }
          } else {
            arrayFailed.push(roleId);
          }
        } catch (error) {
          arrayFailed.push(roleId);
        }
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  /**
   * Soft deletes user roles from the database by setting is_active to '0'.
   *
   * @param {string} id - Comma-separated unique ids of the user roles to delete.
   * @param {string} userId - ID of the user performing the deletion.
   *
   * @throws {UnprocessableEntityError} - If failed to delete user roles.
   *
   * @return {Promise<Object>} - Promise with the result of the update operation.
   */
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
      throw new UnprocessableEntityError('Delete User Role Failed');
    }
  }
}

module.exports = new UserRoleRepository();

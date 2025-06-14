const { Role, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class RoleRepository {
  constructor () {
    this._model = Role;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
        this._primaryKey,
        'role_code',
        'role_name',
        'role_description',
        'created_date'
    ];
  }

  /**
   * Retrieve all roles.
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

  /**
   * Retrieve one role by ID.
   *
   * @param {string} [id] - ID of role.
   *
   * @return {Promise<Object>} - Promise with one role.
   *
   * @throws {BadRequestError} - If id is empty.
   * @throws {NotFoundError} - If role not found.
   */
  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Role Required');

    const data = await this._model.findOne({ where: { unique_id: id } });

    if (!data) throw new NotFoundError('Role not found');

    return data;
  }

  /**
   * Add a new role to the database.
   *
   * @param {string} userId - ID of user who add the role.
   * @param {Object} params - Data to be added to the role.
   * @param {string} params.role_code - Role code of the role.
   * @param {string} params.role_name - Role name of the role.
   * @param {string} params.role_description - Description of the role.
   * @param {string} params.screen_id - Screen ID of the role.
   *
   * @return {Promise<Object>} - Promise with the new role.
   *
   * @throws {ConflictError} - If role code or role name is already existed.
   * @throws {UnprocessableEntityError} - If failed to add role.
   */
  async add (userId, params) {
    const {
      role_code: roleCode,
      role_name: roleName,
      role_description: roleDescription,
      screen_id: screenId
    } = params;

    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_role(:userId, :roleCode, :roleName, :roleDescription, :screenId, :uniqueId);',
        {
          replacements: { userId, roleCode: roleCode.toUpperCase(), roleName, roleDescription, screenId, uniqueId },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          role_id,
          role_name,
          role_code,
          role_description,
          created_by,
          created_date,
          unique_id
        } = results;

        const data = {
          role_id,
          role_name,
          role_code,
          role_description,
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
        throw new UnprocessableEntityError('Add Role Failed');
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
      throw new UnprocessableEntityError('Add Role Failed');
    }
  }

  /**
   * Check if role code or role name is already existed in the database.
   *
   * @param {string} roleCode - Role code of the role.
   * @param {string} roleName - Role name of the role.
   *
   * @return {Promise<number>} - Promise with the number of existing role.
   */
  async checkDuplicate (roleCode, roleName) {
    const check = await this._model.findAll({
			where: {
				[Op.or]: [
					{ role_code: roleCode.toUpperCase() },
					{ role_name: roleName },
				],
			}
    });

    return check.length;
  }

  /**
   * Check if role code or role name is already existed in the database,
   * excluding the given id.
   *
   * @param {string} id - Unique id of the role.
   * @param {string} roleCode - Role code of the role.
   * @param {string} roleName - Role name of the role.
   *
   * @return {Promise<number>} - Promise with the number of existing role.
   */
  async checkDuplicateEdit (id, roleCode, roleName) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { role_code: roleCode.toUpperCase() },
					{ role_name: roleName },
        ],
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  /**
   * Update an existing role in the database.
   *
   * @param {string} id - Unique id of the role to update.
   * @param {string} userId - ID of the user performing the update.
   * @param {Object} params - Data to update the role.
   * @param {string} params.role_code - New role code of the role.
   * @param {string} params.role_name - New role name of the role.
   * @param {string} params.role_description - New description of the role.
   *
   * @return {Promise<Object>} - Promise with the updated role.
   *
   * @throws {ConflictError} - If role code or role name is already existed.
   * @throws {UnprocessableEntityError} - If failed to update role.
   */
  async update (id, userId, params) {
    const {
      role_code: roleCode,
      role_name: roleName,
      role_description: roleDescription,
    } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_role(:userId, :roleCode, :roleName, :roleDescription, :uniqueId);',
        {
          replacements: { userId, roleCode: roleCode.toUpperCase(), roleName, roleDescription, uniqueId: id },
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
        throw new UnprocessableEntityError('Update Role Failed');
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
      throw new UnprocessableEntityError('Update Role Failed');
    }
  }

  /**
   * Soft deletes roles from the database by setting is_active to '0'.
   *
   * @param {string} id - Comma-separated unique ids of the roles to delete.
   * @param {string} userId - ID of the user performing the deletion.
   *
   * @throws {UnprocessableEntityError} - If failed to delete roles.
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
      throw new UnprocessableEntityError('Delete Role Failed');
    }
  }
}

module.exports = new RoleRepository();

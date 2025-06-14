const { MenuGroup, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class MenuGroupRepository {
  constructor () {
    this._model = MenuGroup;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
        this._primaryKey,
        'menu_group_code',
        'menu_group_name',
        'menu_group_description',
        'created_date'
    ];
  }

  /**
   * Retrieve all menuGroups.
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
   * Retrieve one menuGroup by ID.
   *
   * @param {string} [id] - ID of menuGroup.
   *
   * @return {Promise<Object>} - Promise with one menuGroup.
   *
   * @throws {BadRequestError} - If id is empty.
   * @throws {NotFoundError} - If menuGroup not found.
   */
  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Menu Group Required');

    const data = await this._model.findOne({ where: { unique_id: id } });

    if (!data) throw new NotFoundError('Menu Group not found');

    return data;
  }

  /**
   * Add a new menuGroup to the database.
   *
   * @param {string} userId - ID of user who add the menuGroup.
   * @param {Object} params - Data to be added to the menuGroup.
   * @param {string} params.menu_group_code - MenuGroup code of the menuGroup.
   * @param {string} params.menu_group_name - MenuGroup name of the menuGroup.
   * @param {string} params.menu_group_description - Description of the menuGroup.
   * @param {string} params.screen_id - Screen ID of the menuGroup.
   *
   * @return {Promise<Object>} - Promise with the new menuGroup.
   *
   * @throws {ConflictError} - If menuGroup code or menuGroup name is already existed.
   * @throws {UnprocessableEntityError} - If failed to add menuGroup.
   */
  async add (userId, params) {
    const {
      menu_group_code: menuGroupCode,
      menu_group_name: menuGroupName,
      menu_group_description: menuGroupDescription,
      screen_id: screenId
    } = params;

    // Generate UUID
    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_menu_group(:userId, :menuGroupCode, :menuGroupName, :menuGroupDescription, :screenId, :uniqueId);',
        {
          replacements: {
            userId,
            menuGroupCode: menuGroupCode.toUpperCase(),
            menuGroupName,
            menuGroupDescription,
            screenId,
            uniqueId
          },
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          menu_group_id,
          menu_group_code,
          menu_group_name,
          menu_group_description,
          created_by,
          created_date,
          uniqueId
        } = results;

        const data = {
          menu_group_id,
          menu_group_code,
          menu_group_name,
          menu_group_description,
          created_by,
          created_date,
          uniqueId
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
        throw new UnprocessableEntityError('Add Menu Group Failed');
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
      throw new UnprocessableEntityError('Add Menu Group Failed');
    }
  }

  /**
   * Check if menuGroup code or menuGroup name is already existed in the database.
   *
   * @param {string} menuGroupCode - MenuGroup code of the menuGroup.
   * @param {string} menuGroupName - MenuGroup name of the menuGroup.
   *
   * @return {Promise<number>} - Promise with the number of existing menuGroup.
   */
  async checkDuplicate (menuGroupCode, menuGroupName) {
    const check = await this._model.findAll({
			where: {
				[Op.or]: [
					{ menu_group_code: menuGroupCode.toUpperCase() },
					{ menu_group_name: menuGroupName },
				],
			}
    });

    return check.length;
  }

  /**
   * Check if menuGroup code or menuGroup name is already existed in the database,
   * excluding the given id.
   *
   * @param {string} id - Unique id of the menuGroup.
   * @param {string} menuGroupCode - MenuGroup code of the menuGroup.
   * @param {string} menuGroupName - MenuGroup name of the menuGroup.
   *
   * @return {Promise<number>} - Promise with the number of existing menuGroup.
   */
  async checkDuplicateEdit (id, menuGroupCode, menuGroupName) {
    const check = await this._model.findAll({
      where: {
        [Op.or]: [
          { menu_group_code: menuGroupCode.toUpperCase() },
					{ menu_group_name: menuGroupName },
        ],
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  /**
   * Update an existing menuGroup in the database.
   *
   * @param {string} id - Unique id of the menuGroup to update.
   * @param {string} userId - ID of the user performing the update.
   * @param {Object} params - Data to update the menuGroup.
   * @param {string} params.menu_group_code - New menuGroup code of the menuGroup.
   * @param {string} params.menu_group_name - New menuGroup name of the menuGroup.
   * @param {string} params.menu_group_description - New description of the menuGroup.
   *
   * @return {Promise<Object>} - Promise with the updated menuGroup.
   *
   * @throws {ConflictError} - If menuGroup code or menuGroup name is already existed.
   * @throws {UnprocessableEntityError} - If failed to update menuGroup.
   */
  async update (id, userId, params) {
    const {
      menu_group_code: menuGroupCode,
      menu_group_name: menuGroupName,
      menu_group_description: menuGroupDescription,
    } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_menu_group(:userId, :menuGroupCode, :menuGroupName, :menuGroupDescription, :uniqueId);',
        {
          replacements: {
            userId,
            menuGroupCode: menuGroupCode.toUpperCase(),
            menuGroupName,
            menuGroupDescription,
            uniqueId: id
          },
          type: sequelize.QueryTypes.RAW
        }
      );

      const { return_code, return_message, unique_id } = results;

      // Check if results exist
      if (results) {

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
        throw new UnprocessableEntityError('Update Menu Group Failed');
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
      throw new UnprocessableEntityError('Update Menu Group Failed');
    }
  }

  /**
   * Soft deletes menuGroups from the database by setting is_active to '0'.
   *
   * @param {string} id - Comma-separated unique ids of the menuGroups to delete.
   * @param {string} userId - ID of the user performing the deletion.
   *
   * @throws {UnprocessableEntityError} - If failed to delete menuGroups.
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
      throw new UnprocessableEntityError('Delete Menu Group Failed');
    }
  }
}

module.exports = new MenuGroupRepository();

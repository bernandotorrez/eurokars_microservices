const { UserMenuGroup, MenuGroup, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserMenuGroupRepository {
  constructor () {
    this._model = UserMenuGroup;
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
      '$user_menu_group.menu_group.menu_group_code$',
      '$user_menu_group.menu_group.menu_group_name$',
      '$user_menu_group.menu_group.menu_group_description$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: MenuGroup.scope('withoutTemplateFields'),
        as: 'menu_group',
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
        model: UserMenuGroup.scope('withoutTemplateFields'),
        as: 'user_menu_group',
        include: {
          model: MenuGroup.scope('withoutTemplateFields'),
          as: 'menu_group',
          required: true
        }
      }
    ];
  }

  /**
   * Retrieve all user menu groups.
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
 * Retrieve one user menu group by ID.
 *
 * @param {string} [id] - ID of the user menu group.
 *
 * @return {Promise<Object>} - Promise with one user menu group.
 *
 * @throws {BadRequestError} - If id is empty.
 * @throws {NotFoundError} - If user menu group not found.
 */
  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID User Menu Group Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userMenuGroup = await this._userModel.findOne(querySql);

    if (!userMenuGroup) throw new NotFoundError('User Menu Group not found');

    return userMenuGroup;
  }

  /**
   * Retrieve one user menu group by user ID.
   *
   * @param {string} [id] - ID of the user.
   *
   * @return {Promise<Object>} - Promise with one user menu group.
   *
   * @throws {BadRequestError} - If id is empty.
   * @throws {NotFoundError} - If user not found.
   */
  async getOneUser (id = '') {
    if (id === '') throw new BadRequestError('User Required');

    const querySql = {};

    querySql.where = { [this._userPrimaryKey]: id };
    querySql.include = this._userIncludeModels;

    const userMenuGroup = await this._userModel.findOne(querySql);

    if (!userMenuGroup) throw new NotFoundError('User not found');

    return userMenuGroup;
  }

  /**
   * Add new user menu group.
   *
   * @param {string} oid - ID of user who add the user menu group.
   * @param {Object} params - Data to be added to the user menu group.
   * @param {string} params.menu_group_id - Menu group IDs to be added.
   * @param {string} params.user_id - User ID of the user menu group.
   * @param {string} params.screen_id - Screen ID of the user menu group.
   *
   * @return {Promise<Object>} - Promise with the result of add user menu group.
   *
   * @throws {UnprocessableEntityError} - If failed to add user menu group.
   */
  async add (oid, params) {
    const { menu_group_id: arrayMenuGroupId, user_id: userId, screen_id: screenId } = params;

    const splitMenuGroupId = arrayMenuGroupId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const menuGroupId of splitMenuGroupId) {
      const checkDuplicate = await this.checkDuplicate(menuGroupId, userId);

      const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

      if (checkDuplicate >= 1) {
        arrayDuplicated.push(menuGroupId);
      } else {
        try {
          await this._model.create({
            [this._primaryKey]: generateId[0][0].generated_id,
            menu_group_id: menuGroupId,
            user_id: userId,
            created_by: oid,
            created_date: timeHis(),
            unique_id: uuidv4().toString()
          });

          arraySuccess.push(menuGroupId);
        } catch (error) {
          arrayFailed.push(menuGroupId);
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
   * Check if user menu group is already existed in the database.
   *
   * @param {string} menuGroupId - Menu group ID of the user menu group.
   * @param {string} userId - User ID of the user menu group.
   *
   * @return {Promise<number>} - Promise with the number of existing user menu group.
   */
  async checkDuplicate (menuGroupId, userId) {
    const check = await this._model.findAll({
      where: {
        menu_group_id: menuGroupId,
        user_id: userId
      }
    });

    return check.length;
  }

/**
 * Check if a user menu group with a specific menuGroupId and userId exists in the database,
 * excluding the given unique id.
 *
 * @param {string} id - Unique id to exclude from the check.
 * @param {string} menuGroupId - Menu group ID to check for existence.
 * @param {string} userId - User ID to check for existence.
 *
 * @return {Promise<number>} - Promise with the number of existing user menu groups.
 */
  async checkDuplicateEdit (id, menuGroupId, userId) {
    const check = await this._model.findAll({
      where: {
        menu_group_id: menuGroupId,
        user_id: userId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  /**
   * Update user menu groups by inserting and removing menu group IDs.
   *
   * @param {string} userId - ID of the user whose menu groups are being updated.
   * @param {string} oid - ID of the user performing the update.
   * @param {Object} params - Data containing menu group IDs and screen ID.
   * @param {Object} params.menu_group_id - Object containing insert and remove lists of menu group IDs.
   * @param {string} params.screen_id - Screen ID for generating unique IDs.
   *
   * @return {Promise<Object>} - Promise with the result of updates categorized into success, duplicated, and failed.
   */
  async update (userId, oid, params) {
    // Check Data if Exist
    await this.getOneUser(userId);

    const { menu_group_id: menuGroupId, screen_id: screenId } = params;
    const { insert, remove } = menuGroupId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const menuGroupId of splitInsert) {
        const checkDuplicate = await this.checkDuplicate(menuGroupId, userId);

        const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

        if (checkDuplicate >= 1) {
          arrayDuplicated.push(menuGroupId);
        } else {
          try {
            await this._model.create({
              [this._primaryKey]: generateId[0][0].generated_id,
              menu_group_id: menuGroupId,
              user_id: userId,
              created_by: oid,
              created_date: timeHis(),
              unique_id: uuidv4().toString()
            });

            arraySuccess.push(menuGroupId);
          } catch (error) {
            arrayFailed.push(menuGroupId);
          }
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const menuGroupId of splitRemove) {
        try {
          const update = await this._model.update({
            is_active: '0',
            updated_by: oid,
            updated_date: timeHis()
          },
          {
            where: {
              menu_group_id: menuGroupId,
              user_id: userId,
              is_active: '1'
            }
          });

          if (update[0] === 1) {
            arraySuccess.push(menuGroupId);
          } else {
            arrayFailed.push(menuGroupId);
          }
        } catch (error) {
          arrayFailed.push(menuGroupId);
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
   * Soft deletes user menu groups from the database by setting is_active to '0'.
   *
   * @param {string} id - Comma-separated unique ids of the user menu groups to delete.
   * @param {string} userId - ID of the user performing the deletion.
   *
   * @throws {UnprocessableEntityError} - If failed to delete user menu groups.
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
      throw new UnprocessableEntityError('Delete User Menu Group Failed');
    }
  }
}

module.exports = new UserMenuGroupRepository();

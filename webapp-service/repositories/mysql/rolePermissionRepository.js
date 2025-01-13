const {
  RolePermission,
  MenuGroup,
  HeaderNavigation,
  Role,
  sequelize
} = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class RolePermissionRepository {
  /**
   * Initialize Role Permission Repository
   *
   * @param {object} model - Role Permission model
   * @param {string} primaryKey - Primary key of Role Permission model
   * @param {string} sortBy - The field to be sorted
   * @param {string} sort - The type of sort (ASC or DESC)
   * @param {number} limit - The limit of data to be returned
   * @param {number} number - The offset of data to be returned
   * @param {array} searchFields - The fields to be searched
   */
  constructor() {
    this._model = RolePermission;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'menu_group_id',
      'header_navigation_id',
      'role_id',
      'can_view',
      'can_add',
      'can_edit',
      'can_delete',
      'can_send',
      'can_approve',
      'can_reject',
      'can_report',
      'can_cancel',
      '$menu_group.menu_group_code$',
      '$menu_group.menu_group_name$',
      '$menu_group.menu_group_description$',
      '$header_navigation.header_navigation_name$',
      '$role.role_code$',
      '$role.role_name$',
      '$role.role_description$',
      'created_date'
    ];
    this._includeModels = [
      {
        model: MenuGroup.scope('withoutTemplateFields'),
        as: 'menu_group',
        required: true
      },
      {
        model: HeaderNavigation.scope('withoutTemplateFields'),
        as: 'header_navigation',
        required: true
      },
      {
        model: Role.scope('withoutTemplateFields'),
        as: 'role',
        required: true
      }
    ];
  }

  /**
   * Retrieve all role permissions.
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

    // pagination
    if (search !== 'all') {
      if (page !== '' && typeof page !== 'undefined') {
        let {
          limit,
          number
        } = page;
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

    // Include related models
    querySql.include = this._includeModels;

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  /**
   * Retrieve one role permission by ID.
   *
   * @param {string} [id] - ID of the role permission.
   *
   * @return {Promise<Object>} - Promise with one role permission.
   *
   * @throws {BadRequestError} - If id is empty.
   * @throws {NotFoundError} - If role permission not found.
   */

  async getOne(id = '') {
    if (id === '') throw new BadRequestError('ID Role Permission Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const data = await this._model.findOne(querySql);

    if (!data) throw new NotFoundError('Role Permission not found');

    return data;
  }

  /**
   * Add a new role permission to the database.
   *
   * @param {string} userId - ID of user who add the role permission.
   * @param {Object} params - Data to be added to the role permission.
   * @param {string} params.menu_group_id - Menu group ID of the role permission.
   * @param {string} params.header_navigation_id - Header navigation ID of the role permission.
   * @param {string} params.role_id - Role ID of the role permission.
   * @param {boolean} params.can_view - Can view status of the role permission.
   * @param {boolean} params.can_add - Can add status of the role permission.
   * @param {boolean} params.can_edit - Can edit status of the role permission.
   * @param {boolean} params.can_delete - Can delete status of the role permission.
   * @param {boolean} params.can_send - Can send status of the role permission.
   * @param {boolean} params.can_approve - Can approve status of the role permission.
   * @param {boolean} params.can_reject - Can reject status of the role permission.
   * @param {boolean} params.can_report - Can report status of the role permission.
   * @param {boolean} params.can_cancel - Can cancel status of the role permission.
   * @param {string} params.screen_id - Screen ID of the role permission.
   *
   * @return {Promise<Object>} - Promise with the new role permission.
   *
   * @throws {ConflictError} - If role permission already existed.
   * @throws {UnprocessableEntityError} - If failed to add role permission.
   */
  async add(userId, params) {
    const {
      menu_group_id: menuGroupId,
      header_navigation_id: headerNavigationId,
      role_id: roleId,
      can_view: canView,
      can_add: canAdd,
      can_edit: canEdit,
      can_delete: canDelete,
      can_send: canSend,
      can_approve: canApprove,
      can_reject: canReject,
      can_report: canReport,
      can_cancel: canCancel,
      screen_id: screenId
    } = params;

    const checkDuplicate = await this.checkDuplicate(menuGroupId, headerNavigationId, roleId);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');

    const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

    try {
      return await this._model.create({
        [this._primaryKey]: generateId[0][0].generated_id,
        menu_group_id: menuGroupId,
        header_navigation_id: headerNavigationId,
        role_id: roleId,
        can_view: canView,
        can_add: canAdd,
        can_edit: canEdit,
        can_delete: canDelete,
        can_send: canSend,
        can_approve: canApprove,
        can_reject: canReject,
        can_report: canReport,
        can_cancel: canCancel,
        created_by: userId,
        created_date: timeHis(),
        unique_id: uuidv4().toString()
      });
    } catch (error) {
      throw new UnprocessableEntityError('Add Role Permission Failed');
    }
  }

  /**
   * Check if a role permission with a specific menuGroupId, headerNavigationId and roleId exists in the database.
   *
   * @param {string} menuGroupId - Menu group ID to check for existence.
   * @param {string} headerNavigationId - Header navigation ID to check for existence.
   * @param {string} roleId - Role ID to check for existence.
   *
   * @return {Promise<number>} - Promise with the number of existing role permissions.
   */
  async checkDuplicate(menuGroupId, headerNavigationId, roleId) {
    const check = await this._model.findAll({
      where: {
        menu_group_id: menuGroupId,
        header_navigation_id: headerNavigationId,
        role_id: roleId
      }
    });

    return check.length;
  }

  /**
   * Check if a role permission with a specific menuGroupId, headerNavigationId and roleId exists in the database,
   * excluding the given unique id.
   *
   * @param {string} id - Unique id to exclude from the check.
   * @param {string} menuGroupId - Menu group ID to check for existence.
   * @param {string} headerNavigationId - Header navigation ID to check for existence.
   * @param {string} roleId - Role ID to check for existence.
   *
   * @return {Promise<number>} - Promise with the number of existing role permissions.
   */
  async checkDuplicateEdit(id, menuGroupId, headerNavigationId, roleId) {
    const check = await this._model.findAll({
      where: {
        menu_group_id: menuGroupId,
        header_navigation_id: headerNavigationId,
        role_id: roleId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  /**
   * Update an existing role permission in the database.
   *
   * @param {string} id - Unique id of the role permission to update.
   * @param {string} userId - ID of the user performing the update.
   * @param {Object} params - Data to update the role permission.
   * @param {string} params.menu_group_id - New menu group ID of the role permission.
   * @param {string} params.header_navigation_id - New header navigation ID of the role permission.
   * @param {string} params.role_id - New role ID of the role permission.
   * @param {boolean} params.can_view - New can view status of the role permission.
   * @param {boolean} params.can_add - New can add status of the role permission.
   * @param {boolean} params.can_edit - New can edit status of the role permission.
   * @param {boolean} params.can_delete - New can delete status of the role permission.
   * @param {boolean} params.can_send - New can send status of the role permission.
   * @param {boolean} params.can_approve - New can approve status of the role permission.
   * @param {boolean} params.can_reject - New can reject status of the role permission.
   * @param {boolean} params.can_report - New can report status of the role permission.
   * @param {boolean} params.can_cancel - New can cancel status of the role permission.
   *
   * @return {Promise<Object>} - Promise with the updated role permission.
   *
   * @throws {ConflictError} - If role permission with the same menu group ID, header navigation ID, role ID and unique ID already existed.
   * @throws {UnprocessableEntityError} - If failed to update role permission.
   */
  async update(id, userId, params) {
    // Check Data if Exist
    await this.getOne(id);

    const {
      menu_group_id: menuGroupId,
      header_navigation_id: headerNavigationId,
      role_id: roleId,
      can_view: canView,
      can_add: canAdd,
      can_edit: canEdit,
      can_delete: canDelete,
      can_send: canSend,
      can_approve: canApprove,
      can_reject: canReject,
      can_report: canReport,
      can_cancel: canCancel,
    } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, menuGroupId, headerNavigationId, roleId);

    if (checkDuplicate >= 1) throw new ConflictError('Data Already Created');

    try {
      return await this._model.update({
        menu_group_id: menuGroupId,
        header_navigation_id: headerNavigationId,
        role_id: roleId,
        can_view: canView,
        can_add: canAdd,
        can_edit: canEdit,
        can_delete: canDelete,
        can_send: canSend,
        can_approve: canApprove,
        can_reject: canReject,
        can_report: canReport,
        can_cancel: canCancel,
        updated_by: userId,
        updated_date: timeHis()
      }, {
        where: {
          unique_id: id
        }
      });
    } catch (error) {
      throw new UnprocessableEntityError('Update Role Permission Failed');
    }
  }

  /**
   * Soft deletes role permissions from the database by setting is_active to '0'.
   *
   * @param {string} id - Comma-separated unique ids of the role permissions to delete.
   * @param {string} userId - ID of the user performing the deletion.
   *
   * @throws {UnprocessableEntityError} - If failed to delete role permissions.
   *
   * @return {Promise<Object>} - Promise with the result of the update operation.
   */
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
      throw new UnprocessableEntityError('Delete Role Permission Failed');
    }
  }
}

module.exports = new RolePermissionRepository();

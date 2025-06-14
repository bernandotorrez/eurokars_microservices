const { MenuMenuGroup, MenuGroup, HeaderNavigation, sequelize } = require('../../models');
const { Op, where } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class MenuMenuGroupRepository {
  constructor () {
    this._model = MenuMenuGroup;
    this._menuGroupModel = MenuGroup;
    this._headerNavigationModel = HeaderNavigation;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._menuGroupPrimaryKey = this._menuGroupModel.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._menuGroupSortBy = this._menuGroupPrimaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._menuGroupSearchFields = [
      this._menuGroupPrimaryKey,
      'menu_group_code',
      'menu_group_name',
      'menu_group_description',
      'menu_group_id',
      'created_date'
    ];
    this._menuGroupIncludeModels = [
      {
        model: MenuMenuGroup.scope('withoutTemplateFields'),
        as: 'menu_menu_group',
        include: [
          {
            model: MenuGroup.scope('withoutTemplateFields'),
            as: 'menu_group',
          },
          {
            model: HeaderNavigation.scope('withoutTemplateFields'),
            as: 'header_navigation'
          }
        ]
      }
    ];
    this._modelInclude = [
      {
        model: HeaderNavigation.scope('withoutTemplateFields'),
        as: 'header_navigation'
      },
      {
        model: MenuGroup.scope('withoutTemplateFields'),
        as: 'menu_group'
      }
    ]
  }

  async getAll ({ search, sort, page, menuGroupId }) {
    const querySql = {};

    // Sorting logic
    if (sort && sort.value && sort.sorting) {
      const sortField = sort.value;
      const sortDirection = sort.sorting.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (this._menuGroupSearchFields.includes(sortField)) {
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
          [this._menuGroupPrimaryKey, this._sort]
        ];
      }
    } else {
      // Default sorting
      querySql.order = [
        [this._menuGroupPrimaryKey, this._sort]
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
          [Op.or]: this._menuGroupSearchFields.map((field) => ({
            [field]: {
              [Op.substring]: search
            }
          }))
        };
      }
    }

    // Get Menu Menu Group by Menu Group
    if (menuGroupId !== '' && typeof menuGroupId !== 'undefined') {
      querySql.where = {
        '$menu_menu_group.menu_group_id$': menuGroupId
      }
    }

    querySql.distinct = true;
    querySql.col = this._menuGroupPrimaryKey;
    querySql.include = this._menuGroupIncludeModels;
    querySql.subQuery = false;

    const data = await this._menuGroupModel.findAndCountAll(querySql);

    return data;
  }

  async getAllByMenuGroup (menuGroupId) {
    const querySql = {};

    querySql.include = {
      model: MenuGroup,
      through: { attributes: [] },
      where: {
        menu_group_id: menuGroupId
      }
    };

    const data = await this._headerNavigationModel.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Menu Group Required');

    const querySql = {};

    querySql.where = { [this._menuGroupPrimaryKey]: id };
    querySql.include = this._menuGroupIncludeModels;

    const vendorHeaderNavigation = await this._menuGroupModel.findOne(querySql);

    if (!vendorHeaderNavigation) throw new NotFoundError('Menu Group not found');

    return vendorHeaderNavigation;
  }

  async getOneMenuGroup (id = '') {
    if (id === '') throw new BadRequestError('Menu Group Required');

    const querySql = {};

    querySql.where = { [this._menuGroupPrimaryKey]: id };
    querySql.include = this._menuGroupIncludeModels;

    const vendorHeaderNavigation = await this._menuGroupModel.findOne(querySql);

    if (!vendorHeaderNavigation) throw new NotFoundError('Menu Group not found');

    return vendorHeaderNavigation;
  }

  async add (userId, params) {
    const { header_navigation_id: arrayHeaderNavigationId, menu_group_id: menuGroupId, screen_id: screenId } = params;

    const splitHeaderNavigationId = arrayHeaderNavigationId.split(',').filter(item => item !== '');

    const arrayDuplicated = [];
    const arrayFailed = [];
    const arraySuccess = [];

    for (const headerNavigationId of splitHeaderNavigationId) {
      // Call SP
      const [results] = await sequelize.query(
        'CALL sp_add_ms_menu_menu_group(:userId, :menuGroupId, :headerNavigationId, :screenId, :uniqueId);',
        {
          replacements: { userId, menuGroupId, headerNavigationId, screenId, uniqueId: uuidv4().toString() },
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
            arrayDuplicated.push(headerNavigationId);
          } else if (return_code === 404) {
            arrayFailed.push(headerNavigationId);
          } else if (return_code === 400) {
            arrayFailed.push(headerNavigationId);
          } else {
            arrayFailed.push(headerNavigationId);
          }
        } else {
          // Return the data
          arraySuccess.push(headerNavigationId);
        }
      } else {
        arrayFailed.push(headerNavigationId);
      }
    }

    return {
      success: arraySuccess,
      duplicated: arrayDuplicated,
      failed: arrayFailed
    };
  }

  async checkDuplicate (headerNavigationId, menuGroupId) {
    const check = await this._model.findAll({
      where: {
        menu_group_id: menuGroupId,
        header_navigation_id: headerNavigationId
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, headerNavigationId, menuGroupId) {
    const check = await this._model.findAll({
      where: {
        menu_group_id: menuGroupId,
        header_navigation_id: headerNavigationId,
        unique_id: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (menuGroupId, userId, params) {
    const { header_navigation_id: headerNavigationId, screen_id: screenId } = params;
    const { insert, remove } = headerNavigationId;

    const splitInsert = insert.split(',').filter(item => item !== '');
    const splitRemove = remove.split(',').filter(item => item !== '');

    const arraySuccess = [];
    const arrayDuplicated = [];
    const arrayFailed = [];

    // Insert
    if (splitInsert.length > 0) {
      for (const headerNavigationId of splitInsert) {
        const [results] = await sequelize.query(
          'CALL sp_add_ms_menu_menu_group(:userId, :menuGroupId, :headerNavigationId, :screenId, :uniqueId);',
          {
            replacements: { userId, menuGroupId, headerNavigationId, screenId, uniqueId: uuidv4().toString() },
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
              arrayDuplicated.push(headerNavigationId);
            } else if (return_code === 404) {
              arrayFailed.push(headerNavigationId);
            } else if (return_code === 400) {
              arrayFailed.push(headerNavigationId);
            } else {
              arrayFailed.push(headerNavigationId);
            }
          } else {
            // Return the data
            arraySuccess.push(headerNavigationId);
          }
        } else {
          arrayFailed.push(headerNavigationId);
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const headerNavigationId of splitRemove) {
        try {
          const [results] = await sequelize.query(
            'CALL sp_update_ms_menu_menu_group(:userId, :menuGroupId, :headerNavigationId);',
            {
              replacements: { userId, menuGroupId, headerNavigationId },
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
                arrayDuplicated.push(headerNavigationId);
              } else if (return_code === 404) {
                arrayFailed.push(headerNavigationId);
              } else if (return_code === 400) {
                arrayFailed.push(headerNavigationId);
              } else {
                arrayFailed.push(headerNavigationId);
              }
            } else {
              // Return the data
              arraySuccess.push(headerNavigationId);
            }
          } else {
            arrayFailed.push(headerNavigationId);
          }
        } catch (error) {
          arrayFailed.push(headerNavigationId);
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
      throw new UnprocessableEntityError('Delete Menu Menu Group Failed');
    }
  }
}

module.exports = new MenuMenuGroupRepository();

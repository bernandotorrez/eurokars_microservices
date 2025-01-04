const { MenuMenuGroup, MenuGroup, HeaderNavigation, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class MenuMenuGroupRepository {
  constructor () {
    this._model = MenuMenuGroup;
    this._menuGroupModel = MenuGroup;
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
  }

  async getAll ({ search, sort, page }) {
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

    querySql.distinct = true;
    querySql.col = this._menuGroupPrimaryKey;
    querySql.include = this._menuGroupIncludeModels;
    querySql.subQuery = false;

    const data = await this._menuGroupModel.findAndCountAll(querySql);

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
      const checkDuplicate = await this.checkDuplicate(headerNavigationId, menuGroupId);

      const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

      if (checkDuplicate >= 1) {
        arrayDuplicated.push(headerNavigationId);
      } else {
        try {
          await this._model.create({
            [this._primaryKey]: generateId[0][0].generated_id,
            header_navigation_id: headerNavigationId,
            menu_group_id: menuGroupId,
            created_by: userId,
            created_date: timeHis(),
            unique_id: uuidv4().toString()
          });

          arraySuccess.push(headerNavigationId);
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
    // Check Data if Exist
    await this.getOneMenuGroup(menuGroupId);

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
        const checkDuplicate = await this.checkDuplicate(headerNavigationId, menuGroupId);

        const generateId = await sequelize.query(`SELECT fn_gen_number('${screenId}') AS generated_id`);

        if (checkDuplicate >= 1) {
          arrayDuplicated.push(headerNavigationId);
        } else {
          try {
            await this._model.create({
              [this._primaryKey]: generateId[0][0].generated_id,
              menu_group_id: menuGroupId,
              header_navigation_id: headerNavigationId,
              created_by: userId,
              created_date: timeHis(),
              unique_id: uuidv4().toString()
            });

            arraySuccess.push(headerNavigationId);
          } catch (error) {
            arrayFailed.push(headerNavigationId);
          }
        }
      }
    }

    // Remove
    if (splitRemove.length > 0) {
      for (const headerNavigationId of splitRemove) {
        try {
          const update = await this._model.update({
            is_active: '0',
            updated_by: userId,
            updated_date: timeHis()
          },
          {
            where: {
              menu_group_id: menuGroupId,
              header_navigation_id: headerNavigationId,
              is_active: '1'
            }
          });

          if (update[0] === 1) {
            arraySuccess.push(headerNavigationId);
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
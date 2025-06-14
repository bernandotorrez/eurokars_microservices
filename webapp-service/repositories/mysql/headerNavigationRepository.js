const { HeaderNavigation, sequelize } = require('../../models');
const { Op } = require('sequelize');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class HeaderNavigationRepository {
  constructor () {
    this._model = HeaderNavigation;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._tableName = this._model.getTableName();
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      '$parent.header_navigation_name$',
      'parent_id',
      'header_navigation_name',
      'sort_number',
      'url',
      'remark',
      'is_other_sidebar',
      'level',
      'screen_id',
      'created_date'
    ];
    this._includeModels = [
      {
        model: HeaderNavigation.scope('withoutTemplateFields'),
        as: 'parent',
        required: false
      }
    ];
  }

  async getAll ({ search, sort, page, uniqueId = null }) {
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
          querySql.offset = number === 0 ? 0 : parseInt(number * limit - limit);
        }
      } else {
        querySql.limit = this._limit;
        querySql.offset = this._number;
      }

      // search
      if (search !== '' && typeof search !== 'undefined') {
        querySql.where = {
          [Op.or]: this._searchFields.map((field) => ({
            [field]: {
              [Op.substring]: search
            }
          }))
        };
      }
    } else if (search === 'all' & uniqueId != null) {
      if (!uniqueId) throw new BadRequestError('Unique ID Required');

      querySql.where = {
        unique_id: {
          [Op.ne]: uniqueId
        }
      };
    }

    // const count = await this._model.count({
    //   attributes: [
    //     [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
    //   ]
    // });

    querySql.include = this._includeModels;

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === 'hierarchy') return await this.getHierarchy();

    if (id === '') throw new BadRequestError('ID Header Navigation Required');

    const querySql = {};

    querySql.where = { [this._primaryKey]: id };
    querySql.include = this._includeModels;

    const headerNavigation = await this._model.findOne(querySql);

    if (!headerNavigation) throw new NotFoundError('Header Navigation not found');

    return headerNavigation;
  }

  async getOneByUniqueId (id = '') {
    if (id === 'hierarchy') return await this.getHierarchy();

    if (id === '') throw new BadRequestError('ID Header Navigation Required');

    const querySql = {};

    querySql.where = { unique_id: id };
    querySql.include = this._includeModels;

    const headerNavigation = await this._model.findOne(querySql);

    if (!headerNavigation) throw new NotFoundError('Header Navigation not found');

    return headerNavigation;
  }

  async getHierarchy () {
    // const query = `SELECT * FROM ${this._tableName} WHERE is_active = '1' ORDER BY sort_number ASC;`;

    // const data = await HeaderNavigation.sequelize.query(query, { type: 'SELECT' });

    const querySql = {};

    querySql.order = [['sort_number', 'ASC']];
    querySql.raw = true;

    const data = await this._model.findAndCountAll(querySql);

    // Step 1: Create a map to hold each item by its ID for easy reference
    const map = {};
    data.rows.forEach(item => {
      map[item.header_navigation_id] = { ...item, children: [] };
    });

    // Step 2: Build the hierarchy
    const hierarchy = [];
    data.rows.forEach(item => {
      if (item.parent_id) {
        // If the item has a parent, find its parent and add it to the parent's children array
        map[item.parent_id].children.push(map[item.header_navigation_id]);
      } else {
        // If the item has no parent, it is a top-level item
        hierarchy.push(map[item.header_navigation_id]);
      }
    });

    return {
      count: data.count,
      rows: hierarchy
    };
  }

  async add(userId, params) {
    const {
      parent_id: idParent,
      header_navigation_name: name,
      sort_number: sortNumber,
      url,
      remark,
      is_other_sidebar: isOtherSidebar,
      level,
      screen_id: screenId,
      screen_id_input: screenIdInput
    } = params;

    // Generate UUID
    const uniqueId = uuidv4().toString();

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_add_ms_header_navigation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        {
          replacements: [
            userId,
            idParent || null,
            name,
            sortNumber,
            url,
            remark,
            isOtherSidebar,
            level,
            screenId,
            screenIdInput,
            uniqueId
          ],
          type: sequelize.QueryTypes.RAW
        }
      );

      // Check if results exist
      if (results) {
        const {
          return_code,
          return_message,
          header_navigation_id,
          parent_id,
          header_navigation_name,
          sort_number,
          url,
          remark,
          is_other_sidebar,
          level,
          screen_id,
          screen_id_input,
          unique_id
        } = results;

        const data = {
          header_navigation_id,
          parent_id,
          header_navigation_name,
          sort_number,
          url,
          remark,
          is_other_sidebar,
          level,
          screen_id,
          screen_id_input,
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
        throw new UnprocessableEntityError('Add Header Navigation Failed');
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
      throw new UnprocessableEntityError('Add Header Navigation Failed');
    }
  }

  async checkLevelValidation (id, level) {
    if (id) { // Check if only Client send ID Parent
      const data = await this.getOne(id);

      if (parseInt(level) <= data.level) {
        throw new BadRequestError('Level Menu must be less than Parent Level Menu');
      }
    }
  }

  async checkDuplicate (name, url, level, screenIdInput = '') {
    const querySql = {};

    if (level == '1') {
      querySql.where = {
        [Op.or]: [
          { header_navigation_name: name },
          { screen_id: screenIdInput },
          { url }
        ]
      };
    } else {
      querySql.where = {
        [Op.or]: [
          { header_navigation_name: name },
          { screen_id: screenIdInput },
          { url }
        ],
        url: {
          [Op.ne]: '#'
        }
      };
    }
    const check = await this._model.findAll(querySql);

    return check.length;
  }

  async checkDuplicateEdit (id, name, url, level) {
    const querySql = {};

    if (level == '1') {
      querySql.where = {
        [Op.or]: [
          { header_navigation_name: name },
          { url }
        ],
        unique_id: {
          [Op.ne]: id
        }
      };
    } else {
      querySql.where = {
        [Op.or]: [
          { header_navigation_name: name },
          { url }
        ],
        url: {
          [Op.ne]: '#'
        },
        unique_id: {
          [Op.ne]: id
        }
      };
    }

    const check = await this._model.findAll(querySql);

    return check.length;
  }

  async update (id, userId, params) {
    const {
      parent_id: idParent,
      header_navigation_name: name,
      sort_number: sortNumber,
      url,
      remark,
      is_other_sidebar: isOtherSidebar,
      level
    } = params;

    try {
      // Call the stored procedure
      const [results] = await sequelize.query(
        'CALL sp_update_ms_header_navigation(:userId, :idParent, :name, :sortNumber, :url, :remark, :isOtherSidebar, :level, :uniqueId)',
        {
          replacements: {
            userId,
            idParent,
            name,
            sortNumber,
            url,
            remark,
            isOtherSidebar,
            level,
            uniqueId: id
          },
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
        throw new UnprocessableEntityError('Update Header Navigation Failed');
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
      throw new UnprocessableEntityError('Update Header Navigation Failed');
    }
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
      throw new UnprocessableEntityError('Delete Header Navigation Failed');
    }
  }
}

module.exports = new HeaderNavigationRepository();

const { CounterNumber, HeaderNavigation } = require('../../models');
const { Op } = require('sequelize');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');

class CounterNumberRepository {
  constructor () {
    this._model = CounterNumber;
    this._headerNavigationModel = HeaderNavigation;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._headerNavigationPrimaryKey = this._headerNavigationModel.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._searchFields = [
      this._primaryKey,
      'max_digit',
      'ptn_prefix',
      'seq_flg',
      'note',
      'created_date'
    ];
  }

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
    } else {
      const dataHeaderNavigation = await this._headerNavigationModel.findAll({
        attributes: ['screen_id'],
        where: {
          screen_id: {
            [Op.ne]: null
          }
        },
        raw: true
      });

      const headerNavigationIds = dataHeaderNavigation.map(item => item.screen_id);

      querySql.where = {
        screen_id: {
          [Op.notIn]: headerNavigationIds
        }
      };
    }

    // const count = await this._model.count({
    //   attributes: [
    //     [sequelize.fn('COUNT', sequelize.col(this._primaryKey)), 'count']
    //   ]
    // });

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Counter Number Required');

    const querySql = {};

    querySql.where = { [this._primaryKey]: id };

    const counterNumber = await this._model.findOne(querySql);

    if (!counterNumber) throw new NotFoundError('Counter Number not found');

    return counterNumber;
  }
}

module.exports = new CounterNumberRepository();

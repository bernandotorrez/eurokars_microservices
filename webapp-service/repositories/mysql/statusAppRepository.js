const { StatusApp } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const { timeHis } = require('../../utils/globalFunction');

class StatusAppRepository {
  constructor () {
    this._model = StatusApp;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
  }

  async getStatusApps ({ search, sort, page }) {
    const querySql = {};

    // sorting
    if (sort !== '' && typeof sort !== 'undefined') {
      const { value, sorting } = sort;
      const arrayQuerySort = [this._sortBy, this._sort];

      if (value !== '' && typeof value !== 'undefined') {
        arrayQuerySort[0] = value;
      }

      if (sorting !== '' && typeof sorting !== 'undefined') {
        arrayQuerySort[1] = sorting;
      }

      querySql.order = [[arrayQuerySort[0], arrayQuerySort[1]]];
    } else {
      querySql.order = [[this._primaryKey, this._sort]];
    }

    // pagination
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
        [Op.or]: [
          {
            model: {
              [Op.substring]: search
            }
          },
          {
            type: {
              [Op.substring]: search
            }
          },
          {
            colour: {
              [Op.substring]: search
            }
          }
        ]
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

  async getStatusApp (id = '') {
    if (id === '') throw new BadRequestError('ID Status App Required');

    const statusApp = await this._model.findOne({ where: { id_status_app: id } });

    if (!statusApp) throw new NotFoundError('Status App not found');

    return statusApp;
  }

  async addStatusApp (statusApp, redirectUrl) {
    try {
      return await this._model.create({
        status_app: statusApp,
        redirect_url: redirectUrl
      });
    } catch (error) {
      throw new InvariantError('Add Status App Failed');
    }
  }

  async updateStatusApp (id, statusApp, redirectUrl) {
    if (id === '') throw new BadRequestError('ID not Provided');

    const checkStatusApp = await this._model.findOne({ where: { id_status_app: id } });

    if (!checkStatusApp) throw new NotFoundError('Status App not found');

    try {
      return await this._model.update({
        status_app: statusApp,
        redirect_url: redirectUrl,
        updated_at: timeHis()
      }, {
        where: {
          id_status_app: id
        }
      });
    } catch (error) {
      throw new InvariantError('Update Status App Failed');
    }
  }

  async deleteStatusApp (id) {
    if (id === '') throw new BadRequestError('ID Status App Required');

    const arrayId = id.split(',');

    try {
      return await this._model.destroy({ where: { id_status_app: { [Op.in]: arrayId } } });
    } catch (error) {
      throw new InvariantError('Delete Status App Failed');
    }
  }
}

module.exports = new StatusAppRepository();

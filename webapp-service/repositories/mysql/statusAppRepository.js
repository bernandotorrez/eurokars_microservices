const { StatusApp } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis, capitalEachWord } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class StatusAppRepository {
  constructor () {
    this._model = StatusApp;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
  }

  async getAll ({ search, sort, page }) {
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
            status_app: {
              [Op.substring]: search
            }
          },
          {
            redirect_url: {
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

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID Status App Required');

    const data = await this._model.findOne({ where: { id_status_app: id } });

    if (!data) throw new NotFoundError('Status App not found');

    return data;
  }

  async add (params) {
    const { status_app: statusApp, redirect_url: redirectUrl } = params;

    const checkDuplicate = await this.checkDuplicate(statusApp);

    if (checkDuplicate >= 1) throw new ConflictError(`${statusApp} already Created`);

    try {
      return await this._model.create({
        id_status_app: uuidv4().toString(),
        status_app: capitalEachWord(statusApp),
        redirect_url: redirectUrl
      });
    } catch (error) {
      throw new InvariantError('Add Status App Failed');
    }
  }

  async checkDuplicate (statusApp) {
    const check = await this._model.findAll({
      where: {
        status_app: capitalEachWord(statusApp)
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, statusApp) {
    const check = await this._model.findAll({
      where: {
        status_app: capitalEachWord(statusApp),
        id_status_app: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (id, params) {
    if (id === '') throw new BadRequestError('ID not Provided');

    const checkStatusApp = await this._model.findOne({ where: { id_status_app: id } });

    if (!checkStatusApp) throw new NotFoundError('Status App not found');

    const { status_app: statusApp, redirect_url: redirectUrl } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, statusApp);

    if (checkDuplicate >= 1) throw new ConflictError(`${statusApp} already Created`);

    try {
      return await this._model.update({
        status_app: capitalEachWord(statusApp),
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

  async delete (id) {
    await this.getOne(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        status: '0',
        deleted_at: timeHis()
      },
      {
        where: {
          id_status_app: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new InvariantError('Delete Status App Failed');
    }
  }
}

module.exports = new StatusAppRepository();

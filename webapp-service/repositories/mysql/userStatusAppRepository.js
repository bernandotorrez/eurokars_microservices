const { UserStatusApp } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserStatusAppRepository {
  constructor () {
    this._model = UserStatusApp;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
  }

  async getUserStatusApps ({ search, sort, page }) {
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
            id_status_app: {
              [Op.substring]: search
            }
          },
          {
            id_user: {
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

  async getUserStatusApp (id = '') {
    if (id === '') throw new BadRequestError('ID User Status App Required');

    const userStatusApp = await this._model.findOne({ where: { id_user_status_app: id } });

    if (!userStatusApp) throw new NotFoundError('User Status App not found');

    return userStatusApp;
  }

  async addUserStatusApp (params) {
    const { id_status_app: idStatusApp, id_user: idUser } = params;

    const checkDuplicate = await this.checkDuplicate(idStatusApp, idUser);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');

    try {
      return await this._model.create({
        id_user_status_app: uuidv4().toString(),
        id_status_app: idStatusApp,
        id_user: idUser
      });
    } catch (error) {
      throw new InvariantError('Add Status App Failed');
    }
  }

  async checkDuplicate (idStatusApp, idUser) {
    const check = await this._model.findAll({
      where: {
        id_status_app: idStatusApp,
        id_user: idUser
      }
    });

    return check.length;
  }
}

module.exports = new UserStatusAppRepository();

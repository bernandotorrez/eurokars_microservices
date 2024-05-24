const { Vehicle } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');

class VehicleRepository {
  constructor () {
    this._model = Vehicle;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
  }

  async getVehicles ({ search, sort, page }) {
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

  async getVehicle (id = '') {
    if (id === '') throw new BadRequestError('ID Vehicle Required');

    const vehicle = await this._model.findOne({ where: { id_vehicle: id } });

    if (!vehicle) throw new NotFoundError('Vehicle not found');

    return vehicle;
  }

  async addVehicle (params) {
    const {
      model,
      type,
      colour,
      fuel,
      chassis,
      engine_no,
      date_reg,
      curr,
      price
    } = params;

    try {
      return await this._model.create({
        model,
        type,
        colour,
        fuel,
        chassis,
        engine_no,
        date_reg,
        curr,
        price
      });
    } catch (error) {
      throw new InvariantError('Add Vehicle Failed');
    }
  }

  async updateVehicle (id, params) {
    const {
      model,
      type,
      colour,
      fuel,
      chassis,
      engine_no,
      date_reg,
      curr,
      price
    } = params;

    if (id === '') throw new BadRequestError('ID not Provided');

    const vehicle = await this._model.findOne({ where: { id_vehicle: id } });

    if (!vehicle) throw new NotFoundError('Vehicle not found');

    try {
      return await this._model.update({
        model,
        type,
        colour,
        fuel,
        chassis,
        engine_no,
        date_reg,
        curr,
        price
      }, {
        where: {
          id_vehicle: id
        }
      });
    } catch (error) {
      throw new InvariantError('Update Vehicle Failed');
    }
  }

  async deleteVehicle (id) {
    if (id === '') throw new BadRequestError('ID Vehicle Required');

    // const vehicle = await this._model.findOne({ where: { id_vehicle: id } });

    // if (!vehicle) throw new NotFoundError('Vehicle not found');

    const arrayId = id.split(',');

    try {
      return await this._model.destroy({ where: { id_vehicle: { [Op.in]: arrayId } } });
    } catch (error) {
      throw new InvariantError('Delete Vehicle Failed');
    }
  }
}

module.exports = new VehicleRepository();

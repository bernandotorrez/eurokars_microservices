const { Company } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class StatusAppRepository {
  constructor () {
    this._model = Company;
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
    if (id === '') throw new BadRequestError('ID Company Required');

    const data = await this._model.findOne({ where: { id_company: id } });

    if (!data) throw new NotFoundError('Company not found');

    return data;
  }

  async add (params) {
    const { company, company_short: companyShort } = params;
    console.log(params)

    const checkDuplicate = await this.checkDuplicate(company, companyShort);

    if (checkDuplicate >= 1) throw new ConflictError(`${company} - ${companyShort}  already Created`);

    try {
      return await this._model.create({
        id_company: uuidv4().toString(),
        company,
        company_short: companyShort,
        created_at: timeHis()
      });
    } catch (error) {
      throw new InvariantError('Add Company Failed');
    }
  }

  async checkDuplicate (company, companyShort) {
    const check = await this._model.findAll({
      where: {
        company,
        company_short: companyShort
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, company, companyShort) {
    const check = await this._model.findAll({
      where: {
        company,
        company_short: companyShort,
        id_company: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (id, params) {
    // Check Data if Exist
    await this.getOne(id);

    const { company, company_short: companyShort } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, company, companyShort);

    if (checkDuplicate >= 1) throw new ConflictError(`${company} - ${companyShort}  already Created`);

    try {
      return await this._model.update({
        company,
        company_short: companyShort,
        updated_at: timeHis()
      }, {
        where: {
          id_company: id
        }
      });
    } catch (error) {
      throw new InvariantError('Update Company Failed');
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
          id_company: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new InvariantError('Delete Company Failed');
    }
  }
}

module.exports = new StatusAppRepository();

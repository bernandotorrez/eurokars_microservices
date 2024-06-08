const { Department } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis, capitalEachWord } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class DepartmentRepository {
  constructor () {
    this._model = Department;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
  }

  async getDepartments ({ search, sort, page }) {
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
            department: {
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

  async getDepartment (id = '') {
    if (id === '') throw new BadRequestError('ID Department Required');

    const department = await this._model.findOne({ where: { id_department: id } });

    if (!department) throw new NotFoundError('Department not found');

    return department;
  }

  async addDepartment (params) {
    const { department } = params;

    const checkDuplicate = await this.checkDuplicate(department);

    if (checkDuplicate >= 1) throw new ConflictError(`${department} already Created`);

    try {
      return await this._model.create({
        id_department: uuidv4().toString(),
        department: capitalEachWord(department)
      });
    } catch (error) {
      throw new InvariantError('Add Department Failed');
    }
  }

  async checkDuplicate (department) {
    const check = await this._model.findAll({
      where: {
        department: capitalEachWord(department)
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, department) {
    const check = await this._model.findAll({
      where: {
        department: capitalEachWord(department),
        id_department: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async updateDepartment (id, params) {
    if (id === '') throw new BadRequestError('ID Department not Provided');

    const checkDepartment = await this._model.findOne({ where: { id_department: id } });

    if (!checkDepartment) throw new NotFoundError('Department not found');

    const { department } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, department);

    if (checkDuplicate >= 1) throw new ConflictError(`${department} alrady Created`);

    try {
      return await this._model.update({
        department: capitalEachWord(department),
        updated_at: timeHis()
      }, {
        where: {
          id_department: id
        }
      });
    } catch (error) {
      throw new InvariantError('Update Department Failed');
    }
  }

  async deleteDepartment (id) {
    await this.getDepartment(id);

    const arrayId = id.split(',');

    try {
      return await this._model.update({
        status: '0',
        deleted_at: timeHis()
      },
      {
        where: {
          id_department: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new InvariantError('Delete Department Failed');
    }
  }
}

module.exports = new DepartmentRepository();

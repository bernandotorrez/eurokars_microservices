const { UserDepartment, Department, User } = require('../../models');
const { Op } = require('sequelize');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const BadRequestError = require('../../exceptions/BadRequestError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');
const { v4: uuidv4 } = require('uuid');

class UserStatusAppRepository {
  constructor () {
    this._model = UserDepartment;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
    this._includeModels = [
      {
        model: Department.scope('withoutTemplateFields'),
        as: 'department',
        required: true
      },
      {
        model: User.scope('withoutTemplateFields'),
        as: 'user',
        required: true
      }
    ];
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
            id_department: {
              [Op.substring]: search
            }
          },
          {
            id_user: {
              [Op.substring]: search
            }
          },
          {
            '$department.department$': { // Search in field relation
              [Op.substring]: search
            }
          },
          {
            '$user.first_name$': { // Search in field relation
              [Op.substring]: search
            }
          },
          {
            '$user.last_name$': { // Search in field relation
              [Op.substring]: search
            }
          },
          {
            '$user.full_name$': { // Search in field relation
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

    querySql.include = this._includeModels;

    const data = await this._model.findAndCountAll(querySql);

    return data;
  }

  async getOne (id = '') {
    if (id === '') throw new BadRequestError('ID User Department Required');

    const querySql = {};

    querySql.where = { id_user_department: id };
    querySql.include = this._includeModels;

    const userDepartment = await this._model.findOne(querySql);

    if (!userDepartment) throw new NotFoundError('User Department not found');

    return userDepartment;
  }

  async add (params) {
    const { id_department: idDepartment, id_user: idUser } = params;

    const checkDuplicate = await this.checkDuplicate(idDepartment, idUser);

    if (checkDuplicate >= 1) throw new ConflictError('Data already Created');

    try {
      return await this._model.create({
        id_user_department: uuidv4().toString(),
        id_department: idDepartment,
        id_user: idUser,
        created_at: timeHis()
      });
    } catch (error) {
      throw new InvariantError('Add User Department Failed');
    }
  }

  async checkDuplicate (idDepartment, idUser) {
    const check = await this._model.findAll({
      where: {
        id_department: idDepartment,
        id_user: idUser
      }
    });

    return check.length;
  }

  async checkDuplicateEdit (id, idDepartment) {
    const check = await this._model.findAll({
      where: {
        id_department: idDepartment,
        id_user_department: {
          [Op.ne]: id
        }
      }
    });

    return check.length;
  }

  async update (id, params) {
    // Check Data if Exist
    await this.getOne(id);

    const { id_department: idDepartment } = params;

    const checkDuplicate = await this.checkDuplicateEdit(id, idDepartment);

    if (checkDuplicate >= 1) throw new ConflictError('User Department already Created');

    try {
      return await this._model.update({
        id_department: idDepartment,
        updated_at: timeHis()
      }, {
        where: {
          id_user_department: id
        }
      });
    } catch (error) {
      throw new InvariantError('Update User Department Failed');
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
          id_user_department: {
            [Op.in]: arrayId
          }
        }
      });
    } catch (error) {
      throw new InvariantError('Delete User Department Failed');
    }
  }
}

module.exports = new UserStatusAppRepository();

const {
  User,
  UserStatusApp,
  StatusApp,
  UserDepartment,
  Department
} = require('../../models');

const InvariantError = require('../../exceptions/InvariantError');
const BadRequestError = require('../../exceptions/BadRequestError');
const NotFoundError = require('../../exceptions/NotFoundError');

const {
  timeHis
} = require('../../utils/globalFunction');

class UserRepository {
  constructor () {
    this._model = User;
    this._userStatusApp = UserStatusApp;
    this._includeModels = [
      {
        model: UserStatusApp.scope('withoutTemplateFields'),
        as: 'user_status_app',
        include: [{
          model: StatusApp.scope('withoutTemplateFields'),
          as: 'status_app'
        }]
      },
      {
        model: UserDepartment.scope('withoutTemplateFields'),
        as: 'user_department',
        include: [{
          model: Department.scope('withoutTemplateFields'),
          as: 'department'
        }]
      }
    ];
  }

  async registerSSO ({
    uniqueId,
    mail,
    givenName,
    surname,
    displayName,
    ipAddr,
    logoutUri
  }) {
    // Register

    const user = await this._model.findOne({ where: { id_user: uniqueId } });

    if (!user) {
      const insert = await this._model.create({
        id_user: uniqueId,
        email: mail,
        first_name: givenName,
        last_name: surname,
        full_name: displayName,
        last_ip_address: ipAddr,
        last_login_at: timeHis(),
        created_at: timeHis(),
        logout_uri: logoutUri
      });

      if (!insert) throw new InvariantError('Failed insert data');
    } else {
      await this.getById(uniqueId);

      await this._model.update({
        last_ip_address: ipAddr,
        last_login_at: timeHis(),
        logout_uri: logoutUri
      }, {
        where: {
          id_user: uniqueId
        }
      });
    }

    return user;
  }

  async getById (id) {
    if (id === '') throw new BadRequestError('ID User Required');

    const querySql = {};

    querySql.where = {
      id_user: id
    };
    querySql.include = this._includeModels;

    const user = await this._model.findOne(querySql);

    if (!user) throw new NotFoundError('User not found');

    return user;
  }
}

module.exports = new UserRepository();

const {
  User,
  UserStatusApp,
  StatusApp,
  UserDepartment,
  Department
} = require('../../models');

const InvariantError = require('../../exceptions/InvariantError');

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
    ipAddr
  }) {
    const user = await this._model.findOne({
      where: {
        id_user: uniqueId
      }
    });

    if (!user) {
      const insert = await this._model.create({
        id_user: uniqueId,
        email: mail,
        first_name: givenName,
        last_name: surname,
        full_name: displayName,
        last_ip_address: ipAddr,
        last_login_at: timeHis()
      });

      if (!insert) throw new InvariantError('Failed insert data');
    } else {
      await this._model.update({
        last_ip_address: ipAddr,
        last_login_at: timeHis()
      }, {
        where: {
          id_user: uniqueId
        }
      });
    }

    return user;
  }

  async getById (idUser) {
    const querySql = {};

    querySql.where = {
      id_user: idUser
    };

    querySql.include = this._includeModels;

    return this._model.findOne(querySql);
  }
}

module.exports = new UserRepository();

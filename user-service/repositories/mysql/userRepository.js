const { User } = require('../../models');
// const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');
// const ConflictError = require('../../exceptions/ConflictError');

class UserRepository {
  constructor () {
    this._model = User;
  }

  async getAll () {
    return this._model.scope('withoutPassword').findAll();
  }

  async getUserByUuid (uuid) {
    return this._model.scope('withoutPassword').findOne({ where: { uuid } });
  }
}

module.exports = new UserRepository();

const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');
const { timeHis } = require('../../utils/globalFunction');

class UserRepository {
  constructor () {
    this._model = User;
  }

  async registerSSO ({ uniqueId, mail, givenName, surname, displayName, ipAddr }) {
    const user = await this._model.findOne({ where: { id_user: uniqueId } });

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

  async login (username, password) {
    const user = await this._model.findOne({ where: { username } });

    if (!user || user == null) {
      throw new NotFoundError('Username not found');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new InvariantError('Username or Password is Incorrect');
    }

    return user;
  }

  async register (username, password, email, level = 'User') {
    const user = await this._model.scope('withoutPassword').findOne({ where: { username } });
    if (user) {
      throw new ConflictError('Username Already Exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await this._model.create({
        uuid: uuidv4(),
        username,
        email,
        password: hashedPassword,
        level
      });

      return user;
    } catch (error) {
      throw new InvariantError('Failed Register User');
    }
  }

  async getUserByUsername (username) {
    return this._model.scope('withoutPassword').findOne({ where: { username } });
  }

  async getById (idUser) {
    return this._model.findOne({ where: { id_user: idUser } });
  }
}

module.exports = new UserRepository();

const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');

class UserRepository {
  constructor () {
    this._model = User;
  }

  async registerSSO ({ uniqueId, mail, givenName, surname, displayName }) {
    const user = await this._model.findOne({ where: { id_user: uniqueId } });

    if (!user) {
      const insert = await this._model.create({
        id_user: uniqueId,
        email: mail,
        first_name: givenName,
        last_name: surname,
        full_name: displayName
      });

      if (!insert) throw new InvariantError('Failed insert data');
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
}

module.exports = new UserRepository();

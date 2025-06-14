const { RequestLog, sequelize } = require('../../models');
const UnprocessableEntityError = require('../../exceptions/UnprocessableEntityError');

class RequestLogRepository {
  constructor () {
    this._model = RequestLog;
    this._primaryKey = this._model.primaryKeyAttribute;
    this._sortBy = this._primaryKey;
    this._sort = 'ASC';
    this._limit = 5;
    this._number = 0;
  }

  async create (params) {
    const {
      method,
      url,
      headers,
      body,
      ip,
      user_agent: userAgent
    } = params;

    try {
      const insert = await this._model.create({
        method,
        url,
        headers: JSON.stringify(headers),
        body: JSON.stringify(body),
        ip,
        user_agent: userAgent
      });

      return insert;

    } catch (error) {
      throw new UnprocessableEntityError('Save Request Log Failed');
    }
  }
}

module.exports = new RequestLogRepository();

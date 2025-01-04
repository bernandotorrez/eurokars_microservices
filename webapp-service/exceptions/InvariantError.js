const ClientError = require('./ClientError');

class UnprocessableEntityError extends ClientError {
  constructor (message, statusCode = 200) {
    super(message, statusCode);
    this.statusCode = statusCode;
    this.name = 'UnprocessableEntityError';
  }
}

module.exports = UnprocessableEntityError;

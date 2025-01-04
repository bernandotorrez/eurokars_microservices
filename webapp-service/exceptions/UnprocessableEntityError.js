class UnprocessableEntityError extends Error {
  constructor (message, statusCode = 422) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'UnprocessableEntityError';
  }
}

module.exports = UnprocessableEntityError;

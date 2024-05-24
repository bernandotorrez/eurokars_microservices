const axios = require('axios');
const { TIMEOUT } = process.env;

module.exports = (baseUrl, token = '') => {
  return axios.create({
    baseURL: baseUrl,
    timeout: parseInt(TIMEOUT),
    headers: {
      get: {
        'Eurokars-Auth-Token': token
      },
      post: {
        'Eurokars-Auth-Token': token
      },
      put: {
        'Eurokars-Auth-Token': token
      },
      delete: {
        'Eurokars-Auth-Token': token
      }
    }
  });
};

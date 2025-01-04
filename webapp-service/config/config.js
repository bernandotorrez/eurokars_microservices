// const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const { DB_USER, DB_PASS, DB_HOST, DB_NAME, DB_PORT, DB_DRIVER } = process.env;

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DRIVER,
    dialectOptions: {
      bigNumberStrings: true
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DRIVER,
    dialectOptions: {
      bigNumberStrings: true
    },
    
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DRIVER,
    dialectOptions: {
      bigNumberStrings: true
    //   ssl: {
    //     ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
    //   }
    }
  }
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RequestLog extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  RequestLog.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER({ length: 10, unsigned: true })
    },
    timestamps: {
      allowNull: true,
      type: DataTypes.DATE
    },
    method: {
      allowNull: true,
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE')
    },
    url: {
      allowNull: true,
      type: DataTypes.STRING(255)
    },
    headers: {
      allowNull: true,
      type: DataTypes.TEXT('long')
    },
    body: {
      allowNull: true,
      type: DataTypes.TEXT('long')
    },
    ip: {
      allowNull: true,
      type: DataTypes.STRING(45)
    },
    user_agent: {
      allowNull: true,
      type: DataTypes.TEXT
    },
  }, {
    sequelize, // Menetapkan koneksi database Simprug
    modelName: 'RequestLog',
    tableName: 'hs_request_log',
    underscored: true,
    timestamps: false,
  });

  return RequestLog;
};

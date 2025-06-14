'use strict';
const tableName = 'hs_request_log';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      timestamps: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      method: {
        allowNull: true,
        type: Sequelize.ENUM('GET', 'POST', 'PUT', 'DELETE')
      },
      url: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      headers: {
        allowNull: true,
        type: Sequelize.TEXT('long')
      },
      body: {
        allowNull: true,
        type: Sequelize.TEXT('long')
      },
      ip: {
        allowNull: true,
        type: Sequelize.STRING(45)
      },
      user_agent: {
        allowNull: true,
        type: Sequelize.TEXT
      }
    }, {
      underscored: true,
      timestamps: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

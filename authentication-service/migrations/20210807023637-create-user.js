'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      level: {
        allowNull: false,
        type: Sequelize.ENUM('Admin', 'User'),
        defaultValue: 'User'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};

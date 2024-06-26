'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      id_status_app: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(100)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      array_id_det_company: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      first_name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      last_name: {
        allowNull: true,
        type: Sequelize.STRING(50)
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },
      created_at: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1'
      }
    });

    // Define indexes
    await queryInterface.addIndex('users', ['id_status_app']);
    await queryInterface.addIndex('users', ['email']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};

'use strict';

const tableName = 'user';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id_user: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(100),
        validate: {
          isEmail: true
        }
      },
      first_name: {
        allowNull: false,
        type: Sequelize.STRING(50),
        comment: 'Azure field: givenName'
      },
      last_name: {
        allowNull: true,
        type: Sequelize.STRING(50),
        comment: 'Azure field: surname'
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING(150),
        comment: 'Azure field: displayName'
      },
      last_ip_address: {
        allowNull: false,
        type: Sequelize.STRING(25)
      },
      last_login_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      logout_uri: {
        allowNull: false,
        type: Sequelize.TEXT
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
        defaultValue: '1',
        comment: '0 = Deleted, 1 = Active'
      }
    });

    // Define indexes
    await queryInterface.addIndex(tableName, {
      fields: ['email'],
      name: 'idx_email'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

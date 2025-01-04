'use strict';

const tableName = 'ms_user';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      user_id: {
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
      created_by: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      created_date: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.STRING(50)
      },
      updated_date: {
        allowNull: true,
        type: Sequelize.DATE
      },
      job_title: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      logout_uri: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      is_active: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        comment: '1 = Active, 0 = Deleted'
      }
    });

    // Define indexes
    await queryInterface.addIndex(tableName, {
      fields: ['email'],
      name: 'idx_email'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: 'idx_is_active_user'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

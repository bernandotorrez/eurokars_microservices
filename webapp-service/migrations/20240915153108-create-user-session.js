'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_user_session';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      user_session_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      user_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      device: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      device_browser: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      device_os: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      device_type: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      token: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      last_active: {
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      logout_date: {
        allowNull: true,
        type: Sequelize.DATE
      },
      is_active: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        comment: '1 = Active, 0 = Deleted'
      }
    });

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['user_id'],
      name: `idx_user_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_user_session',
      references: {
        table: 'ms_user',
        field: 'user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

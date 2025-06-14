'use strict';

const tableName = 'ms_user_status_app';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      user_status_app_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      user_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      status_app_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
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
      unique_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      is_active: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        comment: '1 = Active, 0 = Deleted'
      }
    });

    // Add Index
    await queryInterface.addIndex(tableName, {
      fields: ['user_id'],
      name: `idx_user_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['status_app_id'],
      name: `idx_status_app_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_status_app_user',
      references: {
        table: 'ms_user',
        field: 'user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['status_app_id'],
      type: 'foreign key',
      name: 'fk_user_status_app',
      references: {
        table: 'ms_status_app',
        field: 'status_app_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

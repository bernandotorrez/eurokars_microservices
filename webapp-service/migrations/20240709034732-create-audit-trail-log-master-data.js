'use strict';

const tableName = 'ad_trail_log_master_data';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      audit_trail_log_master_data_id: {
        type: Sequelize.INTEGER.UNSIGNED, // Unsigned integer type
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      module: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },
      execution_type: {
        allowNull: true,
        type: Sequelize.ENUM('INSERT', 'UPDATE', 'DELETE')
      },
      executed_at: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      }
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_audit_trail_log_master_data',
      references: {
        table: 'ms_user',
        field: 'user_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

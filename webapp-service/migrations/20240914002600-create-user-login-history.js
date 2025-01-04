'use strict';

const tableName = 'hs_user_login';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      user_login_history_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      user_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      last_ip_address: {
        allowNull: false,
        type: Sequelize.STRING(25)
      },
      last_login_at: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      }
    });

    // Define indexes
    await queryInterface.addIndex(tableName, {
      fields: ['user_id'],
      name: 'idx_user_id'
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_login_history_user',
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

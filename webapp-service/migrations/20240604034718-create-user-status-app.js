'use strict';

const tableName = 'user_status_app';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id_user_status_app: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      id_user: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      id_status_app: {
        allowNull: false,
        type: Sequelize.STRING(50)
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

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['id_user'],
      type: 'foreign key',
      name: 'fk_user_status_app_user',
      references: {
        table: 'user',
        field: 'id_user'
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['id_status_app'],
      type: 'foreign key',
      name: 'fk_user_status_app',
      references: {
        table: 'status_app',
        field: 'id_status_app'
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

'use strict';

const tableName = 'user_department';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id_user_department: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      id_user: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      id_department: {
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
      name: 'fk_user_department_user',
      references: {
        table: 'user',
        field: 'id_user'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['id_department'],
      type: 'foreign key',
      name: 'fk_user_department',
      references: {
        table: 'department',
        field: 'id_department'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

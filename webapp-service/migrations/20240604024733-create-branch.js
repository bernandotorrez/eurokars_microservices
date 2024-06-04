'use strict';

const tableName = 'branch';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id_branch: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      id_city: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      branch: {
        allowNull: true,
        type: Sequelize.STRING(50)
      },
      address: {
        allowNull: true,
        type: Sequelize.TEXT()
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING(15)
      },
      fax: {
        allowNull: true,
        type: Sequelize.STRING(25)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(100),
        validate: {
          isEmail: true
        }
      },
      short: {
        allowNull: true,
        type: Sequelize.STRING(5)
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
      fields: ['branch'],
      name: 'idx_branch'
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['id_city'],
      type: 'foreign key',
      name: 'fk_branch_city',
      references: {
        table: 'city',
        field: 'id_city'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

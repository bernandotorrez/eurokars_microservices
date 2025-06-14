'use strict';

const tableName = 'ms_branch';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      branch_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      city_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      branch_name: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      branch_code: {
        allowNull: false,
        type: Sequelize.STRING(5)
      },
      address: {
        allowNull: false,
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

    // Define indexes
    await queryInterface.addIndex(tableName, {
      fields: ['city_id'],
      name: `idx_city_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['branch_name'],
      name: `idx_branch_name_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_branch_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['city_id'],
      type: 'foreign key',
      name: 'fk_branch_city',
      references: {
        table: 'ms_city',
        field: 'city_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

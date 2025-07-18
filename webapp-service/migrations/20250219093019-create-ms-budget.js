'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_budget';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      budget_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      budget_code: {
        allowNull: false,
        type: Sequelize.CHAR(13),
        comment: 'Example : B-EAU-25-0001',
        unique: true
      },
      company_detail_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      // total_budget: {
      //   allowNull: false,
      //   type: Sequelize.DECIMAL(20, 2),
      //   comment: 'Example : 10000000.00'
      // },
      year: {
        allowNull: false,
        type: Sequelize.CHAR(4),
        comment: 'Example : 2025'
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

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['company_detail_id'],
      name: `idx_company_detail_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['year'],
      name: `idx_year_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['company_detail_id'],
      type: 'foreign key',
      name: `fk_${tableName}_company_detail_id`,
      references: {
        table: 'ms_company_detail',
        field: 'company_detail_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

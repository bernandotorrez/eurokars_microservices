'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_category_budget';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      category_budget_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      budget_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      sub_coa_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      business_line_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      sub_business_line_1_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      sub_business_line_2_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      category_budget_code: {
        allowNull: false,
        type: Sequelize.STRING(17),
        comment: 'Example : B-EAU-IT-25-0001',
        unique: true
      },
      category_budget_name: {
        allowNull: false,
        type: Sequelize.STRING(200),
        comment: 'Example : IT Hardware'
      },
      total_category_budget: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 2),
        comment: 'Example : 10000000.00'
      },
      total_opening_category_budget: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 2),
        comment: 'Example : 10000000.00'
      },
      remaining_submit: {
        allowNull: true,
        type: Sequelize.DECIMAL(20, 2),
        comment: 'Example : 10000000.00'
      },
      remaining_actual: {
        allowNull: true,
        type: Sequelize.DECIMAL(20, 2),
        comment: 'Example : 10000000.00'
      },
      opex_capex: {
        allowNull: false,
        type: Sequelize.ENUM('OpexRoutine', 'OpexNonRoutine', 'Capex'),
        defaultValue: 'OpexRoutine'
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
      fields: ['budget_id'],
      name: `idx_budget_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['sub_coa_id'],
      name: `idx_sub_coa_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['business_line_id'],
      name: `idx_business_line_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['sub_business_line_1_id'],
      name: `idx_sub_business_line_1_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['sub_business_line_2_id'],
      name: `idx_sub_business_line_2_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['category_budget_name'],
      name: `idx_category_budget_name_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['budget_id'],
      type: 'foreign key',
      name: `fk_${tableName}_budget_id`,
      references: {
        table: 'ms_budget',
        field: 'budget_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['sub_coa_id'],
      type: 'foreign key',
      name: `fk_${tableName}_sub_coa_id`,
      references: {
        table: 'ms_sub_coa',
        field: 'sub_coa_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['business_line_id'],
      type: 'foreign key',
      name: `fk_${tableName}_business_line_id`,
      references: {
        table: 'ms_business_line',
        field: 'business_line_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['sub_business_line_1_id'],
      type: 'foreign key',
      name: `fk_${tableName}_sub_business_line_1_id`,
      references: {
        table: 'ms_sub_business_line_1',
        field: 'sub_business_line_1_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['sub_business_line_2_id'],
      type: 'foreign key',
      name: `fk_${tableName}_sub_business_line_2_id`,
      references: {
        table: 'ms_sub_business_line_2',
        field: 'sub_business_line_2_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_company_detail';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      company_detail_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      company_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      brand_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      branch_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      department_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      division_id: {
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

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['company_id'],
      name: `idx_company_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['brand_id'],
      name: `idx_brand_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['branch_id'],
      name: `idx_branch_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['department_id'],
      name: `idx_department_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['division_id'],
      name: `idx_division_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_company_detail_company_id',
      references: {
        table: 'ms_company',
        field: 'company_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['brand_id'],
      type: 'foreign key',
      name: 'fk_company_detail_brand_id',
      references: {
        table: 'ms_brand',
        field: 'brand_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_company_detail_branch_id',
      references: {
        table: 'ms_branch',
        field: 'branch_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_company_detail_department_id',
      references: {
        table: 'ms_department',
        field: 'department_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['division_id'],
      type: 'foreign key',
      name: 'fk_company_detail_division_id',
      references: {
        table: 'ms_division',
        field: 'division_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

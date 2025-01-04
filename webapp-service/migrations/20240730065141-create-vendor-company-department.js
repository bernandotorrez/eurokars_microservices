'use strict';

const tableName = 'ms_vendor_company_department';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      vendor_company_department_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      vendor_company_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      department_id: {
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

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['vendor_company_id'],
      type: 'foreign key',
      name: 'fk_vendor_company_department_vendor_company',
      references: {
        table: 'ms_vendor_company',
        field: 'vendor_company_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['department_id'], // ini foreign key dari table yang ini
      type: 'foreign key',
      name: 'fk_vendor_company_department_department',
      references: {
        table: 'ms_department',
        field: 'department_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: 'idx_is_active_vendor_company_department'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

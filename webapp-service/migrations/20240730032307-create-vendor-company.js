'use strict';

const tableName = 'ms_vendor_company';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      vendor_company_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      vendor_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      company_id: {
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
      fields: ['vendor_id'],
      name: `idx_vendor_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['company_id'],
      name: `idx_company_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['vendor_id'],
      type: 'foreign key',
      name: 'fk_vendor_company_vendor',
      references: {
        table: 'ms_vendor',
        field: 'vendor_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_vendor_company_company',
      references: {
        table: 'ms_company',
        field: 'company_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: 'idx_is_active_vendor_company'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

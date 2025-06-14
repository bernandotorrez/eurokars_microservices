'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_coa';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      coa_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      coa_code: {
        allowNull: false,
        type: Sequelize.STRING(10),
        comment: 'Example : COA01'
      },
      coa_name: {
        allowNull: false,
        type: Sequelize.STRING(50),
        comment: 'Example : Operating Expenses'
      },
      coa_description: {
        allowNull: false,
        type: Sequelize.STRING(200),
        comment: 'Example : Coa for Operating Expenses'
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
      fields: ['coa_code'],
      name: `idx_coa_code_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['coa_name'],
      name: `idx_coa_name_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

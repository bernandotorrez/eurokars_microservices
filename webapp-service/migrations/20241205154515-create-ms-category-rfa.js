'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_category_rfa';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      category_rfa_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      category_rfa_code: {
        allowNull: false,
        type: Sequelize.STRING(10),
        comment: 'Example : ADM01'
      },
      category_rfa_name: {
        allowNull: false,
        type: Sequelize.STRING(50),
        comment: 'Example : Admin'
      },
      category_rfa_description: {
        allowNull: false,
        type: Sequelize.TEXT()
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
      fields: ['category_rfa_code'],
      name: `idx_category_rfa_code_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['category_rfa_name'],
      name: `idx_category_rfa_name_${tableName}`
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

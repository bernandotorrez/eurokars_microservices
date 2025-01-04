'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_tax';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      tax_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      tax_description: {
        allowNull: false,
        type: Sequelize.STRING(200),
        comment: 'Example : Pajak Penambahan Nilai'
      },
      tax_code: {
        allowNull: false,
        type: Sequelize.STRING(10),
        comment: 'Example : PPN'
      },
      tax_flag: {
        allowNull: true,
        type: Sequelize.TINYINT({ length: 3, unsigned: true })
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
      fields: ['tax_flag'],
      name: 'idx_tax_flag'
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

'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_company';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      company_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      company_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      company_code: {
        allowNull: false,
        type: Sequelize.CHAR(3)
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
      tax_id: {
        allowNull: false,
        type: Sequelize.STRING(25),
        comment: 'NPWP'
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
      fields: ['company_name'],
      name: 'idx_company_name'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['company_code'],
      name: 'idx_company_code'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: 'idx_is_active_company'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable(tableName);
  }
};

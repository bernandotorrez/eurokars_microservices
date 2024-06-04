'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'company';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      id_company: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      company: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      company_short: {
        allowNull: false,
        type: Sequelize.CHAR(3)
      },
      created_at: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        comment: '0 = Deleted, 1 = Active'
      }
    });

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['company'],
      name: 'idx_company'
    });
    await queryInterface.addIndex(tableName, {
      fields: ['company_short'],
      name: 'idx_company_short'
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

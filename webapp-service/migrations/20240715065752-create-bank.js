'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_bank';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      bank_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      bank_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      local_code: {
        allowNull: false,
        type: Sequelize.CHAR(3)
      },
      swift_code: {
        allowNull: false,
        type: Sequelize.CHAR(8)
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
      fields: ['bank_name'],
      name: `idx_bank_name_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['local_code'],
      name: `idx_local_code_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['swift_code'],
      name: `idx_swift_code_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
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

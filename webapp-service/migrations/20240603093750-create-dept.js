'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'department';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      id_department: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      department: {
        allowNull: false,
        type: Sequelize.STRING(50)
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
      fields: ['department'],
      name: 'idx_department'
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

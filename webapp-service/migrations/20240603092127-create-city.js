'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_city';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      city_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      province_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      city_name: {
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
      fields: ['city_name'],
      name: 'idx_city_name'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: 'idx_is_active_city'
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['province_id'],
      type: 'foreign key',
      name: 'fk_city_province',
      references: {
        table: 'ms_province',
        field: 'province_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
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

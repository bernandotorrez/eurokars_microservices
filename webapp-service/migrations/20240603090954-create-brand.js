'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'brand';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      id_brand: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      id_vehicle_type: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      brand: {
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
      fields: ['brand'],
      name: 'idx_brand'
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['id_vehicle_type'],
      type: 'foreign key',
      name: 'fk_brand_vehicle_type',
      references: {
        table: 'vehicle_type',
        field: 'id_vehicle_type'
      },
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
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

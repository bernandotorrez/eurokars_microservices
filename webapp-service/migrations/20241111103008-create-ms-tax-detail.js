'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_tax_detail';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      tax_detail_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      tax_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      tax_detail_description: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      percentage: {
        allowNull: false,
        type: Sequelize.DOUBLE(5, 2)
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
      fields: ['percentage'],
      name: 'idx_percentage'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['tax_id'],
      name: `idx_tax_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['tax_id'],
      type: 'foreign key',
      name: `fk_${tableName}_tax_id`,
      references: {
        table: 'ms_tax',
        field: 'tax_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

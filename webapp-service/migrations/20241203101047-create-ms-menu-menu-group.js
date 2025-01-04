'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_menu_menu_group';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      menu_menu_group_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      menu_group_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      header_navigation_id: {
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
      fields: ['menu_group_id'],
      name: `idx_menu_group_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['header_navigation_id'],
      name: `idx_header_navigation_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    // Adding constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['menu_group_id'],
      type: 'foreign key',
      name: `fk_${tableName}_menu_group_id`,
      references: {
        table: 'ms_menu_group',
        field: 'menu_group_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['header_navigation_id'],
      type: 'foreign key',
      name: `fk_${tableName}_header_navigation_id`,
      references: {
        table: 'ms_header_navigation',
        field: 'header_navigation_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_role_permission';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      role_permission_id: {
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
      role_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      can_view: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to VIEW | 1 = Can, 0 = Can\'t'
      },
      can_add: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to ADD | 1 = Can, 0 = Can\'t'
      },
      can_edit: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to EDIT | 1 = Can, 0 = Can\'t'
      },
      can_delete: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to DELETE | 1 = Can, 0 = Can\'t'
      },
      can_send: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to SEND APPROVAL | 1 = Can, 0 = Can\'t'
      },
      can_approve: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to APPROVED | 1 = Can, 0 = Can\'t'
      },
      can_reject: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to REJECT | 1 = Can, 0 = Can\'t'
      },
      can_reject: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to REJECT | 1 = Can, 0 = Can\'t'
      },
      can_report: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to REPORT | 1 = Can, 0 = Can\'t'
      },
      can_cancel: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: 'Is User Able to CANCEL | 1 = Can, 0 = Can\'t'
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
      fields: ['role_id'],
      name: `idx_role_id_${tableName}`
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

    await queryInterface.addConstraint(tableName, {
      fields: ['role_id'],
      type: 'foreign key',
      name: `fk_${tableName}_role_id`,
      references: {
        table: 'ms_role',
        field: 'role_id'
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
  }
};

'use strict';

const tableName = 'ms_header_navigation';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      header_navigation_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      parent_id: {
        allowNull: true,
        type: Sequelize.STRING(50),
        comment: 'Refer to Header Navigation ID, if Parent then NULL if Child then Refer to Header Navigation ID'
      },
      header_navigation_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      sort_number: {
        allowNull: false,
        type: Sequelize.TINYINT.UNSIGNED
      },
      url: {
        allowNull: true,
        type: Sequelize.STRING(100),
        defaultValue: '#'
      },
      remark: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      level: {
        allowNull: false,
        type: Sequelize.TINYINT.UNSIGNED
      },
      is_other_sidebar: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '0',
        comment: '1 = Show in Section Other Sidebar, 0 = None'
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
      screen_id: {
        allowNull: true,
        type: Sequelize.STRING(10)
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
      fields: ['is_active'],
      name: `idx_is_active_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['parent_id'],
      name: `idx_parent_id_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_other_sidebar'],
      name: `idx_is_other_sidebar_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['sort_number'],
      name: `idx_sort_number_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['header_navigation_name'],
      name: `idx_header_navigation_name_${tableName}`
    });

    await queryInterface.addIndex(tableName, {
      fields: ['level'],
      name: `idx_level_${tableName}`
    });

    // Adding Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['screen_id'],
      type: 'foreign key',
      name: 'fk_header_navigation_screen_id',
      references: {
        table: 'ms_counter_number',
        field: 'screen_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

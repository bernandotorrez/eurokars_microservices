'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_vendor_beneficiary';
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable(tableName, {
      vendor_beneficiary_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      vendor_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      bank_id: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      beneficiary_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      account_number: {
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
      fields: ['beneficiary_name'],
      name: 'idx_beneficiary_name'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['account_number'],
      name: 'idx_account_number'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_active'],
      name: 'idx_is_active_vendor_bank_beneficiary'
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['bank_id'],
      type: 'foreign key',
      name: 'fk_vendor_beneficiary_bank',
      references: {
        table: 'ms_bank',
        field: 'bank_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.addConstraint(tableName, {
      fields: ['vendor_id'],
      type: 'foreign key',
      name: 'fk_vendor_beneficiary_vendor',
      references: {
        table: 'ms_vendor',
        field: 'vendor_id'
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

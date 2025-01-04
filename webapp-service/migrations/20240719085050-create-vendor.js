'use strict';

const tableName = 'ms_vendor';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      vendor_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(50)
      },
      vendor_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      address: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING(20),
        comment: 'Vendor Person Phone | Example : 6289687610639'
      },
      telephone: {
        allowNull: true,
        type: Sequelize.STRING(20),
        comment: 'Vendor Company Telephone | Example : 021-9925252'
      },
      fax: {
        allowNull: true,
        type: Sequelize.STRING(25),
        comment: 'Vendor Company Telephone | Example : 021-9925252'
      },
      contact_person: {
        allowNull: false,
        type: Sequelize.STRING(100),
        comment: 'Yang bisa di hubungi'
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      postal_code: {
        allowNull: false,
        type: Sequelize.STRING(25)
      },
      tax_id: {
        allowNull: true,
        type: Sequelize.STRING(25),
        comment: 'NPWP'
      },
      identity_number: {
        allowNull: true,
        type: Sequelize.STRING(25)
      },
      is_national: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        comment: '1 = Nasional 0 = International'
      },
      is_company: {
        allowNull: false,
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        comment: '1 = Company 0 = Person'
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
      fields: ['is_active'],
      name: 'idx_is_active_vendor'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['vendor_name'],
      name: 'idx_vendor'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_national'],
      name: 'idx_is_national_vendor'
    });

    await queryInterface.addIndex(tableName, {
      fields: ['is_company'],
      name: 'idx_is_company_vendor'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

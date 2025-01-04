'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here

      Vendor.hasMany(models.VendorBankBeneficiary, {
        foreignKey: 'vendor_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'vendor_bank_beneficiary',
        scope: { is_active: '1' }
      });

      Vendor.hasMany(models.VendorCompany, {
        foreignKey: 'vendor_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'vendor_company',
        scope: { is_active: '1' }
      });
    }
  };
  Vendor.init({
    vendor_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    vendor_name: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    address: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    phone: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: 'Vendor Person Phone | Example : 6289687610639'
    },
    telephone: {
      allowNull: true,
      type: DataTypes.STRING(20),
      comment: 'Vendor Company Telephone | Example : 021-9925252'
    },
    fax: {
      allowNull: true,
      type: DataTypes.STRING(25),
      comment: 'Vendor Company Telephone | Example : 021-9925252'
    },
    contact_person: {
      allowNull: false,
      type: DataTypes.STRING(100),
      comment: 'Yang bisa di hubungi'
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    postal_code: {
      allowNull: false,
      type: DataTypes.STRING(25)
    },
    tax_id: {
      allowNull: false,
      type: DataTypes.STRING(25),
      comment: 'NPWP'
    },
    identity_number: {
      allowNull: false,
      type: DataTypes.STRING(25)
    },
    is_national: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '1 = Nasional 0 = International'
    },
    is_company: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '1 = Company 0 = Person'
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    created_date: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updated_by: {
      allowNull: true,
      type: DataTypes.STRING(50)
    },
    updated_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
    unique_id: {
      allowNull: true,
      type: DataTypes.STRING(50)
    },
    is_active: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    }
  }, {
    sequelize,
    modelName: 'Vendor',
    tableName: 'ms_vendor',
    createdAt: 'created_date',
    underscored: true,
    timestamps: false,
    defaultScope: {
      where: {
        is_active: '1'
      }
    },
    scopes: {
      withoutTemplateFields: {
        attributes: { exclude: ['created_date', 'created_by', 'updated_date', 'updated_by', 'is_active'] }
      },
      active: {
        where: {
          is_active: '1'
        }
      },
      deleted: {
        where: {
          is_active: '0'
        }
      }
    }
  });
  return Vendor;
};

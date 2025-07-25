'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VendorBankBeneficiary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      VendorBankBeneficiary.belongsTo(models.Bank, {
        foreignKey: 'bank_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'bank',
        scope: { is_active: '1' }
      });

      VendorBankBeneficiary.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'vendor',
        scope: { is_active: '1' }
      });
    }
  };
  VendorBankBeneficiary.init({
    vendor_beneficiary_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    vendor_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    bank_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    beneficiary_name: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    account_number: {
      allowNull: false,
      type: DataTypes.STRING(50),
      unique: true
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
    modelName: 'VendorBankBeneficiary',
    tableName: 'ms_vendor_beneficiary',
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
  return VendorBankBeneficiary;
};

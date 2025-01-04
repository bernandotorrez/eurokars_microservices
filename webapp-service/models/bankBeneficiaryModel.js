'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BankBeneficiary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      BankBeneficiary.belongsTo(models.Bank, {
        foreignKey: 'id_bank',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'bank',
        scope: { is_active: '1' }
      });
    }
  };
  BankBeneficiary.init({
    id_bank_beneficiary: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    id_bank: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    beneficiary_name: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    account_number: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    created_date: {
      allowNull: false,
      type: DataTypes.DATE
    },
    is_active: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    }
  }, {
    sequelize,
    modelName: 'BankBeneficiary',
    tableName: 'ms_bank_beneficiary',
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
  return BankBeneficiary;
};

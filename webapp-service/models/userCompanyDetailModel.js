'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCompanyDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      UserCompanyDetail.belongsTo(models.CompanyDetail, {
        foreignKey: 'company_detail_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'company_detail',
        scope: { is_active: '1' }
      });

      UserCompanyDetail.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user',
        scope: { is_active: '1' }
      });
    }
  };
  UserCompanyDetail.init({
    user_company_detail_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    user_id: {
      allowNull: false,
      type: DataTypes.STRING(50),
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    company_detail_id: {
      allowNull: false,
      type: DataTypes.STRING(50),
      references: {
        model: 'company_detail',
        key: 'company_detail_id'
      }
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
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    }
  }, {
    sequelize,
    modelName: 'UserCompanyDetail',
    tableName: 'ms_user_company_detail',
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
  return UserCompanyDetail;
};

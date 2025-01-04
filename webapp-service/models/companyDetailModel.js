'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      CompanyDetail.belongsTo(models.Company, {
        foreignKey: 'company_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'company',
        scope: { is_active: '1' }
      });

      CompanyDetail.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'brand',
        scope: { is_active: '1' }
      });

      CompanyDetail.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'branch',
        scope: { is_active: '1' }
      });

      CompanyDetail.belongsTo(models.Department, {
        foreignKey: 'department_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'department',
        scope: { is_active: '1' }
      });

      CompanyDetail.belongsTo(models.Division, {
        foreignKey: 'division_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'division',
        scope: { is_active: '1' }
      });
    }
  };
  CompanyDetail.init({
    company_detail_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    company_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    brand_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    branch_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    department_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    division_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
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
    modelName: 'CompanyDetail',
    tableName: 'ms_company_detail',
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
  return CompanyDetail;
};

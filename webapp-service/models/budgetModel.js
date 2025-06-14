'use strict';
const {
  Model,
  Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Budget.belongsTo(models.Company, {
        foreignKey: 'company_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'company',
        scope: { is_active: '1' }
      });

      Budget.belongsTo(models.Brand, {
        foreignKey: 'brand_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'brand',
        scope: { is_active: '1' }
      });

      Budget.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'branch',
        scope: { is_active: '1' }
      });

      Budget.belongsTo(models.Department, {
        foreignKey: 'department_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'department',
        scope: { is_active: '1' }
      });

    }
  };
  Budget.init({
    budget_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    budget_code: {
      allowNull: false,
      type: DataTypes.CHAR(13),
      comment: 'Example : B-EAU-25-0001'
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
    // total_budget: {
    //   allowNull: false,
    //   type: DataTypes.DECIMAL(20, 2),
    //   comment: 'Example : 10000000.00'
    // },
    year: {
      allowNull: false,
      type: DataTypes.CHAR(4),
      comment: 'Example : 2025'
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
      allowNull: false,
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
    modelName: 'Budget',
    tableName: 'ms_budget',
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
      },
      all: {
        where: {
          is_active: {
            [Op.in]: ['0', '1']
          }
        }
      }
    }
  });
  return Budget;
};

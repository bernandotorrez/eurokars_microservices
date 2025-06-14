'use strict';
const {
  Model,
  Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoryBudget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      CategoryBudget.belongsTo(models.Budget, {
        foreignKey: 'budget_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'budget',
        scope: { is_active: '1' }
      });

      CategoryBudget.belongsTo(models.SubCoa, {
        foreignKey: 'sub_coa_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'sub_coa',
        scope: { is_active: '1' }
      });

      CategoryBudget.belongsTo(models.BusinessLine, {
        foreignKey: 'business_line_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'business_line',
        scope: { is_active: '1' }
      });

      CategoryBudget.belongsTo(models.SubBusinessLineOne, {
        foreignKey: 'sub_business_line_1_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'sub_business_line_1',
        scope: { is_active: '1' }
      });

      CategoryBudget.belongsTo(models.SubBusinessLineTwo, {
        foreignKey: 'sub_business_line_2_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'sub_business_line_2',
        scope: { is_active: '1' }
      });

    }
  };
  CategoryBudget.init({
    category_budget_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    budget_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    sub_coa_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    business_line_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    sub_business_line_1_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    sub_business_line_2_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    category_budget_code: {
      allowNull: false,
      type: DataTypes.STRING(17),
      comment: 'Example : B-EAU-IT-25-0001'
    },
    category_budget_name: {
      allowNull: false,
      type: DataTypes.STRING(200),
      comment: 'Example : IT Hardware'
    },
    total_category_budget: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2),
      comment: 'Example : 10000000.00'
    },
    total_opening_category_budget: {
      allowNull: false,
      type: DataTypes.DECIMAL(20, 2),
      comment: 'Example : 10000000.00'
    },
    remaining_submit: {
      allowNull: true,
      type: DataTypes.DECIMAL(20, 2),
      comment: 'Example : 10000000.00'
    },
    remaining_actual: {
      allowNull: true,
      type: DataTypes.DECIMAL(20, 2),
      comment: 'Example : 10000000.00'
    },
    opex_capex: {
      allowNull: false,
      type: DataTypes.ENUM('OpexRoutine', 'OpexNonRoutine', 'Capex'),
      defaultValue: 'OpexRoutine'
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
    modelName: 'CategoryBudget',
    tableName: 'ms_category_budget',
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
  return CategoryBudget;
};

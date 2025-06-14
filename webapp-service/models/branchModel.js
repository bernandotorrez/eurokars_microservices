'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Branch.belongsTo(models.City, {
        foreignKey: 'city_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'city',
        scope: { is_active: '1' }
      });

      Branch.hasMany(models.CompanyDetail, {
        foreignKey: 'branch_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'company_detail',
        scope: { is_active: '1' }
      });
    }
  }
  Branch.init(
    {
      branch_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(50)
      },
      city_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      branch_name: {
        allowNull: true,
        type: DataTypes.STRING(50)
      },
      address: {
        allowNull: true,
        type: DataTypes.TEXT()
      },
      phone: {
        allowNull: false,
        type: DataTypes.STRING(15)
      },
      fax: {
        allowNull: true,
        type: DataTypes.STRING(25)
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
        validate: {
          isEmail: true
        }
      },
      branch_code: {
        allowNull: true,
        type: DataTypes.STRING(5)
      },
      created_by: {
        allowNull: true,
        type: DataTypes.STRING(50)
      },
      created_date: {
        allowNull: true,
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
    },
    {
      sequelize,
      modelName: 'Branch',
      tableName: 'ms_branch',
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
    }
  );
  return Branch;
};

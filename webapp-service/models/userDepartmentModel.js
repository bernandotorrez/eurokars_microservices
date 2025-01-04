'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDepartment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      UserDepartment.belongsTo(models.Department, {
        foreignKey: 'department_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'department',
        scope: { is_active: '1' }
      });

      UserDepartment.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user',
        scope: { is_active: '1' }
      });
    }
  };
  UserDepartment.init({
    user_department_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    user_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    department_id: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    created_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
    is_active: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    }
  }, {
    sequelize,
    modelName: 'UserDepartment',
    tableName: 'ms_user_department',
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
  return UserDepartment;
};

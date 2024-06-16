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
        foreignKey: 'id_department',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        keyType: 'string',
        as: 'department',
        scope: { status: '1' }
      });

      UserDepartment.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        keyType: 'string',
        as: 'user',
        scope: { status: '1' }
      });
    }
  };
  UserDepartment.init({
    id_user_department: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    id_user: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    id_department: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    created_at: {
      allowNull: true,
      type: DataTypes.DATE
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '1',
      comment: '0 = Deleted, 1 = Active'
    }
  }, {
    sequelize,
    modelName: 'UserDepartment',
    tableName: 'user_department',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    timestamps: false,
    defaultScope: {
      where: {
        status: '1'
      }
    },
    scopes: {
      withoutTemplateFields: {
        attributes: { exclude: ['created_at', 'updated_at', 'deleted_at', 'status'] }
      },
      active: {
        where: {
          status: '1'
        }
      }
    }
  });
  return UserDepartment;
};

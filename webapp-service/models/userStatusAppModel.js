'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserStatusApp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      UserStatusApp.belongsTo(models.StatusApp, {
        foreignKey: 'id_status_app',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        keyType: 'string',
        as: 'status_app',
        scope: { status: '1' }
      });

      UserStatusApp.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        keyType: 'string',
        as: 'user',
        scope: { status: '1' }
      });
    }
  };
  UserStatusApp.init({
    id_user_status_app: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    id_user: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    id_status_app: {
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
    modelName: 'UserStatusApp',
    tableName: 'user_status_app',
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
  return UserStatusApp;
};

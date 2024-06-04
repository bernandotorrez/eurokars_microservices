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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        keyType: 'string',
        as: 'status_app'
      });

      UserStatusApp.belongsTo(models.User, {
        foreignKey: 'id_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        keyType: 'string',
        as: 'user'
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

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here

      UserSession.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user',
        scope: { is_active: '1' }
      });
    }
  }
  UserSession.init(
    {
      user_session_id: {
        type: DataTypes.STRING(50),
        primaryKey: true
      },
      user_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      device: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      device_browser: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      device_os: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      device_type: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      token: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      last_active: {
        allowNull: true,
        type: DataTypes.DATE
      },
      logout_date: {
        allowNull: true,
        type: DataTypes.DATE
      },
      is_active: {
        type: DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '1',
        comment: '1 = Active, 0 = Deleted'
      }
    },
    {
      sequelize,
      modelName: 'UserSession',
      tableName: 'ms_user_session',
      underscored: true,
      timestamps: false,
      defaultScope: {
        where: {
          is_active: '1'
        }
      }
    }
  );
  return UserSession;
};

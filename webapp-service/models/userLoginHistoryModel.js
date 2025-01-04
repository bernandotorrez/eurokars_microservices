'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here

      UserLoginHistory.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user',
        scope: { is_active: '1' }
      });
    }
  }
  UserLoginHistory.init(
    {
      user_login_history_id: {
        type: DataTypes.STRING(50),
        primaryKey: true
      },
      user_id: {
        allowNull: false,
        type: DataTypes.STRING(50)
      },
      last_ip_address: {
        allowNull: false,
        type: DataTypes.STRING(25)
      },
      last_login_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'UserLoginHistory',
      tableName: 'hs_user_login',
      underscored: true,
      timestamps: false
    }
  );
  return UserLoginHistory;
};

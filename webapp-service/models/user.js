'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      User.belongsTo(models.StatusApp, {
        foreignKey: 'id_status_app',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        keyType: 'string'
      });
    }
  };
  User.init({
    id_user: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    id_status_app: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Azure field: givenName'
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Azure field: surname'
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Azure field: displayName'
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
    modelName: 'User',
    tableName: 'user',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });
  return User;
};

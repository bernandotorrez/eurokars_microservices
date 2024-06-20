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
      User.hasMany(models.UserStatusApp, {
        foreignKey: 'id_user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        keyType: 'string',
        as: 'user_status_app',
        scope: { status: '1' }
      });

      User.hasMany(models.UserDepartment, {
        foreignKey: 'id_user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        keyType: 'string',
        as: 'user_department',
        scope: { status: '1' }
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
    last_ip_address: {
      allowNull: false,
      type: DataTypes.STRING(25)
    },
    last_login_at: {
      allowNull: false,
      type: DataTypes.DATE
    },
    logout_uri: {
      allowNull: false,
      type: DataTypes.TEXT
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
    modelName: 'User',
    tableName: 'user',
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
      },
      deleted: {
        where: {
          status: '0'
        }
      }
    }
  });
  return User;
};

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
      // User.hasMany(models.UserStatusApp, {
      //   foreignKey: 'id_user',
      //   onDelete: 'RESTRICT',
      //   onUpdate: 'RESTRICT',
      //   keyType: 'string',
      //   as: 'user_status_app',
      //   scope: { is_active: '1' }
      // });

      // User.belongsToMany(models.StatusApp, {
      //   through: {
      //     model: models.UserStatusApp,
      //     scope: { is_active: '1' }
      //   },
      //   foreignKey: 'id_user',
      //   onDelete: 'RESTRICT',
      //   onUpdate: 'RESTRICT',
      //   keyType: 'string',
      //   as: 'status_app',
      //   scope: { is_active: '1' }
      // });

      User.hasMany(models.UserStatusApp, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user_status_app',
        scope: { is_active: '1' }
      });

      User.hasMany(models.UserDivision, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user_division',
        scope: { is_active: '1' }
      });

      User.hasMany(models.UserCompanyDetail, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user_company_detail',
        scope: { is_active: '1' }
      });

      User.hasMany(models.UserMenuGroup, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user_menu_group',
        scope: { is_active: '1' }
      });

      User.hasMany(models.UserRole, {
        foreignKey: 'user_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        keyType: 'string',
        as: 'user_role',
        scope: { is_active: '1' }
      });
    }
  };
  User.init({
    user_id: {
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
    logout_uri: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    created_date: {
      allowNull: false,
      type: DataTypes.DATE
    },
    is_active: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
      defaultValue: '1',
      comment: '1 = Active, 0 = Deleted'
    },
    job_title: {
      allowNull: false,
      type: DataTypes.STRING(100)
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'ms_user',
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
  return User;
};

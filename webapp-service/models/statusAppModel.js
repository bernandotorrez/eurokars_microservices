'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StatusApp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      // StatusApp.belongsToMany(models.User, {
      //   through: {
      //     model: models.UserStatusApp,
      //     scope: { is_active: '1' }
      //   },
      //   foreignKey: 'id_status_app',
      //   onDelete: 'RESTRICT',
      //   onUpdate: 'RESTRICT',
      //   keyType: 'string',
      //   as: 'user',
      //   scope: { is_active: '1' }
      // });

    }
  };
  StatusApp.init({
    status_app_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    status_app_name: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    redirect_url: {
      allowNull: false,
      type: DataTypes.STRING(200)
    },
    created_by: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    created_date: {
      allowNull: false,
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
  }, {
    sequelize,
    modelName: 'StatusApp',
    tableName: 'ms_status_app',
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
  return StatusApp;
};

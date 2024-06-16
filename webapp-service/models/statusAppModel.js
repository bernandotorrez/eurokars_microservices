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
    }
  };
  StatusApp.init({
    id_status_app: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    status_app: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    redirect_url: {
      allowNull: false,
      type: DataTypes.STRING(200)
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
      allowNull: true,
      type: DataTypes.DATE
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '0 = Deleted, 1 = Active'
    }
  }, {
    sequelize,
    modelName: 'StatusApp',
    tableName: 'status_app',
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
  return StatusApp;
};

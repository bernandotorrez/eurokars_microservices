'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Department.init({
    id_department: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    department: {
      allowNull: false,
      type: DataTypes.STRING(50)
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
    modelName: 'Department',
    tableName: 'department',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
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
  return Department;
};

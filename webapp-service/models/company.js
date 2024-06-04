'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Company.init({
    id_company: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(50)
    },
    company: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    company_short: {
      allowNull: false,
      type: DataTypes.STRING(200)
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
    modelName: 'Company',
    tableName: 'company',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });
  return Company;
};

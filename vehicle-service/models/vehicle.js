'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Vehicle.init({
    id_vehicle: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    model: DataTypes.STRING(20),
    type: DataTypes.STRING(20),
    colour: DataTypes.STRING(20),
    fuel: DataTypes.STRING(10),
    chassis: DataTypes.STRING(20),
    engine_no: DataTypes.STRING(20),
    date_reg: DataTypes.DATE,
    curr: DataTypes.STRING(20),
    price: DataTypes.DOUBLE(50, 2)
  }, {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
    timestamps: false,
    underscored: true
  });
  return Vehicle;
};

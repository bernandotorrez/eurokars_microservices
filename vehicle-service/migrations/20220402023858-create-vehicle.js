'use strict';

const tableName = 'vehicles';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id_vehicle: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      model: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      colour: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      fuel: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      chassis: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      engine_no: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      date_reg: {
        allowNull: false,
        type: Sequelize.DATE
      },
      curr: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      price: {
        allowNull: false,
        type: Sequelize.DOUBLE(50, 2)
      }
    });

    await queryInterface.addIndex(tableName, ['model', 'type', 'colour']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};

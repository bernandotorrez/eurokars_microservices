'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_tax';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(tableName, 'tax_flag', {
      type: Sequelize.TINYINT({ length: 3, unsigned: true }),
      autoIncrement: true,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(tableName, 'tax_flag', {
      type: Sequelize.TINYINT({ length: 3, unsigned: true }),
      autoIncrement: false,
      allowNull: true,
    });
  }
};

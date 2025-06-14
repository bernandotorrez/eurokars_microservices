'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'sq_sequence';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER(10)
      },
      screen_id: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      seq_name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      seq_value: {
        allowNull: true,
        type: Sequelize.INTEGER(10)
      }
    });

    // Index
    await queryInterface.addIndex(tableName, {
      fields: ['screen_id'],
      name: `idx_screen_id_${tableName}`
    });

    // Constraint
    await queryInterface.addConstraint(tableName, {
      fields: ['screen_id'],
      type: 'foreign key',
      name: `fk_${tableName}_screen_id`,
      references: {
        table: 'ms_counter_number',
        field: 'screen_id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });

    await queryInterface.sequelize.query(`
      INSERT INTO ${tableName} (id, screen_id, seq_name, seq_value) VALUES
      (1, 'APR01', 'Approval', 1),
      (2, 'BUT01', 'Budget', 1),
      (3, 'CAD01', 'Cash Advanced', 1),
      (4, 'CAS01', 'Cash Advanced Settlement', 1),
      (5, 'DAS01', 'Dashboard', 1),
      (6, 'DPT01', 'Direct Payment', 1),
      (7, 'FPB01', 'FPB', 1),
      (8, 'IAL01', 'Internal Approval', 1),
      (9, 'MBD01', 'Master Brand', 1),
      (10, 'MBH01', 'Master Branch', 1),
      (11, 'MBK01', 'Master Bank', 1),
      (12, 'MBL01', 'Master Business Line', 1),
      (13, 'MBS01', 'Master Business Sub Line 1', 1),
      (14, 'MBS02', 'Master Business Sub Line 2', 1),
      (15, 'MCB01', 'Master Company Bank Beneficiary', 1),
      (16, 'MCD01', 'Master Company Detail', 1),
      (17, 'MCO01', 'Master Company', 1),
      (18, 'MCR01', 'Master Category RFA', 1),
      (19, 'MCT01', 'Master City', 1),
      (20, 'MCY01', 'Master Currency', 1),
      (21, 'MDI01', 'Master Divisi', 1),
      (22, 'MDT01', 'Master Department', 1),
      (23, 'MHH01', 'Master Header Navigation', 1),
      (24, 'MLC01', 'Master List Company Bank', 1),
      (25, 'MMG01', 'Master Menu Group', 1),
      (26, 'MMG02', 'Master Menu - Menu Group', 1),
      (27, 'MPC01', 'Master Province', 1),
      (28, 'MPT01', 'Master Project', 1),
      (29, 'MRO01', 'Master Role', 1),
      (30, 'MRP01', 'Master Role Permission', 1),
      (31, 'MSA01', 'Master Status App', 1),
      (32, 'MTD01', 'Master Tax Detail', 1),
      (33, 'MTT01', 'Master Tax Type', 1),
      (34, 'MUMG01', 'Master User Menu Group', 1),
      (35, 'MUR01', 'Master User', 1),
      (36, 'MURO01', 'Master User Role', 1),
      (37, 'MVB01', 'Master Vendor Bank Beneficiary', 1),
      (38, 'MVC01', 'Master Vendor Company', 1),
      (39, 'MVC02', 'Master Vendor Company Dept', 1),
      (40, 'MVR01', 'Master Vendor', 1),
      (41, 'PCH01', 'Petty Cash', 1),
      (42, 'POP01', 'Purchase Order Inventory Part', 1),
      (43, 'POR01', 'Purchase Order', 1),
      (44, 'POU01', 'Purchase Order Inventory Unit', 1),
      (45, 'PRT01', 'Purchase Request', 1),
      (46, 'RBT01', 'Reimbursement', 1),
      (47, 'RPP01', 'Request Payment With P.O', 1),
      (48, 'RPP02', 'Request Payment With P.O Inventory', 1),
      (49, 'TVL01', 'Travel', 1),
      (50, 'UCD01', 'Master User Company Detail', 1),
      (51, 'UDV001', 'Master User Division', 1),
      (52, 'USA001', 'Master User Status App', 1),
      (53, 'ZLG01', 'Login', 1),
      (54, 'MCOA01', 'Master COA', 1),
      (55, 'MSCOA01', 'Master Sub COA', 1),
      (56, 'MBG01', 'Master Budget', 1),
      (57, 'MCBG01', 'Master Category Budget', 1),
      (58, 'MCBG01', 'Master Configuration', 1),
      (59, 'RFA01', 'Request Form Approval', 1);
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

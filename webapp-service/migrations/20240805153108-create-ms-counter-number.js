'use strict';

/** @type {import('sequelize-cli').Migration} */
const tableName = 'ms_counter_number';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      screen_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(10)
      },
      max_digit: {
        allowNull: false,
        type: Sequelize.INTEGER(2)
      },
      cnt_date: {
        allowNull: true,
        type: Sequelize.STRING(8)
      },
      cnt_date_fmt: {
        allowNull: true,
        type: Sequelize.STRING(8)
      },
      ptn_prefix: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      ptn_suffix: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      curr_value: {
        allowNull: true,
        type: Sequelize.STRING(15)
      },
      max_value: {
        allowNull: true,
        type: Sequelize.STRING(15)
      },
      min_value: {
        allowNull: true,
        type: Sequelize.STRING(15)
      },
      seq_flg: {
        allowNull: false,
        type: Sequelize.INTEGER(11),
        defaultValue: 0
      },
      seq_nm: {
        allowNull: true,
        type: Sequelize.STRING(30)
      },
      note: {
        allowNull: true,
        type: Sequelize.STRING(100)
      },
      category_cd: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      ins_ts: {
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      ins_usr_id: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      upd_cntr: {
        allowNull: false,
        type: Sequelize.INTEGER(9)
      },
      upd_ts: {
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: Sequelize.DATE
      },
      upd_usr_id: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      key_elm: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      c_cnt_ptn: {
        allowNull: false,
        type: Sequelize.STRING(10),
        defaultValue: '*'
      },
      digit: {
        allowNull: true,
        type: Sequelize.INTEGER(2)
      }
    });

    await queryInterface.sequelize.query(`
      INSERT INTO ${tableName} (screen_id, max_digit, cnt_date, cnt_date_fmt, ptn_prefix, ptn_suffix, curr_value, max_value, min_value, seq_flg, seq_nm, note, category_cd, ins_ts, ins_usr_id, upd_cntr, upd_ts, upd_usr_id, key_elm, c_cnt_ptn, digit) VALUES
      ('MCO01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Company', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCD01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Company Detail', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MUR01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master User', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MBD01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Brand', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MPC01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Province', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCT01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master City', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MBH01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Branch', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 18:22:58', 'system', NULL, '-', 5),
      ('MVR01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Vendor', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MDT01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Department', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MDI01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Divisi', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCY01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Currency', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MSA01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Status App', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MBL01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Business Line', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MBS01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Business Sub Line 1', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MBS02', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Business Sub Line 2', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('PRT01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Purchase Request', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('POR01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Purchase Order', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('TVL01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Travel', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('CAD01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Cash Advanced', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('CAS01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Cash Advanced Settlement', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('PCH01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Petty Cash', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('DPT01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Direct Payment', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('IAL01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Internal Approval', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('RPP01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Request Payment With P.O', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('APR01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Approval', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('BUT01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Budget', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('FPB01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'FPB', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('ZLG01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Login', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('RBT01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Reimbursement', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('POP01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Purchase Order Inventory Part', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('POU01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Purchase Order Inventory Unit', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('DAS01', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Dashboard', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:20', 'system', NULL, '/', 5),
      ('RPP02', 20, NULL, '%y%m%d', 'PO', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Request Payment With P.O Inventory', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-26 09:15:37', 'system', NULL, '/', 5),
      ('MBK01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Bank', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-26 14:29:18', 'system', NULL, '-', 5),
      ('MPT01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Project', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('USA001', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master User Status App', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('UDV001', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master User Division', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MVB01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Vendor Bank Beneficiary', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MVC01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Vendor Company', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MHH01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Header Navigation', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCB01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Company Bank Beneficiary', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MLC01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master List Company Bank', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MTT01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Tax Type', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MTD01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Tax Detail', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('UCD01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master User Company Detail', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MVC02', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Vendor Company Dept', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MRO01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Role', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MMG01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Menu Group', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MMG02', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Menu - Menu Group', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MUMG01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master User Menu Group', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MURO01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master User Roles', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MRP01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Role Permission', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCR01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Category RFA', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCOA01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master COA', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MSCOA01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Sub COA', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MBG01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Budget', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCBG01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Category Budget', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('MCG01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Master Configuration', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5),
      ('RFA01', 20, NULL, '%y%m%d', 'MS', NULL, '000000000000000', '999999999999999', '000000000000000', 1, NULL, 'Request Form Approval', NULL, '2024-09-25 00:00:00', 'system', 0, '2024-09-25 16:01:08', 'system', NULL, '-', 5);
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName);
  }
};

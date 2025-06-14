'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_bank';
const event = 'add';
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'bank_id';
const model = 'Bank';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_bank_name VARCHAR(100),
            IN p_local_code CHAR(3),
            IN p_swift_code CHAR(8),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_generated_id VARCHAR(50);
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE bank_name = p_bank_name
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = '${model} already Created';
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Generate ID using an existing function
            SELECT fn_gen_number(p_screen_id) INTO v_generated_id;

            -- Insert new data
            INSERT INTO ${tableName} (${primaryKey}, bank_name, local_code, swift_code, created_by, created_date, unique_id)
            VALUES (v_generated_id, p_bank_name, p_local_code, p_swift_code, p_user_id, NOW(), p_unique_id);

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
              bank_id,
              bank_name,
              local_code,
              swift_code,
              created_date,
              created_by,
              unique_id
              FROM ${tableName} WHERE ${primaryKey} = v_generated_id
              AND is_active = '1'
              LIMIT 1;
          END proc_label;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

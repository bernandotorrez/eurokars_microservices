'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_province';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'province_id';
const model = 'Province';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_province_name VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';
            DECLARE v_exists INT;

            -- Check is data is exist
            SELECT COUNT(${primaryKey}) INTO v_exists
            FROM ${tableName}
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            IF v_exists = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = '${model} not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE province_name = p_province_name
            AND unique_id <> p_unique_id
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = '${model} already Created';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Update data
            UPDATE ${tableName}
            SET province_name = p_province_name,
            updated_by = p_user_id,
            updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            province_id,
            province_name,
            updated_by,
            updated_date,
            unique_id
            FROM ${tableName} WHERE unique_id = p_unique_id
            AND is_active = '1'
            LIMIT 1;

        END proc_label;

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

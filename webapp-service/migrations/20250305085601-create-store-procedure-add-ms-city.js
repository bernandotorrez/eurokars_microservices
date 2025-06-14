'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_city';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'city_id';
const model = 'City';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_province_id VARCHAR(50),
            IN p_city_name VARCHAR(50),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_generated_id VARCHAR(50);
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';
            DECLARE v_exists_province INT;

            -- Check if province exists
            SELECT COUNT(province_id) INTO v_exists_province
            FROM ms_province
            WHERE province_id = p_province_id
            AND is_active = '1';

            IF v_exists_province = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Province not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE province_id = p_province_id
            AND city_name = p_city_name
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = '${model} already Created';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Generate ID using an existing function
            SELECT fn_gen_number(p_screen_id) INTO v_generated_id;

            -- Insert new data
            INSERT INTO ${tableName} (
                ${primaryKey}, province_id, city_name, created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_province_id, p_city_name, p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            city_id,
            province_id,
            city_name,
            created_by,
            created_date,
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

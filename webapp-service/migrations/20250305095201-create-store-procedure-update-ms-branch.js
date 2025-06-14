'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_branch';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'branch_id';
const model = 'Branch';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_city_id VARCHAR(50),
            IN p_branch_name VARCHAR(50),
            IN p_branch_code VARCHAR(5),
            IN p_address TEXT,
            IN p_phone VARCHAR(15),
            IN p_fax VARCHAR(25),
            IN p_email VARCHAR(100),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';
            DECLARE v_exists_city INT;
            DECLARE v_exists INT;

            -- Check if city exists
            SELECT COUNT(city_id) INTO v_exists_city
            FROM ms_city
            WHERE city_id = p_city_id
            AND is_active = '1';

            IF v_exists_city = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'City not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if data is exists
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
            WHERE ((city_id = p_city_id AND branch_name = p_branch_name)
            OR branch_code = p_branch_code)
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
            SET city_id = p_city_id,
            branch_name = p_branch_name,
            branch_code = p_branch_code,
            address = p_address,
            phone = p_phone,
            fax = p_fax,
            email = p_email,
            updated_by = p_user_id,
            updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            branch_id,
            city_id,
            branch_name,
            branch_code,
            address,
            phone,
            fax,
            email,
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

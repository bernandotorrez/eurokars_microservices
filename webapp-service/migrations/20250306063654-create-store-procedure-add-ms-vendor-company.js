'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_vendor_company';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'vendor_company_id';
const model = 'Vendor Company';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_vendor_id VARCHAR(50),
            IN p_company_id VARCHAR(50),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-06] (Bernand Dayamuntari Hermawan) : Create Store Procedure Add ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if vendor exists, if not found then return 404
            * 3. Check if company exists, if not found then return 404
            * 4. Check for duplicates data by checking vendor_id AND company_id, if found then return 409
            * 5. Generate ID using an existing function
            * 6. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_vendor INT; -- menampung variable untuk check vendor
            DECLARE v_exists_company INT; -- menampung variable untuk check company

            -- Check if vendor is exists
            SELECT COUNT(vendor_id) INTO v_exists_vendor
            FROM ms_vendor
            WHERE vendor_id = p_vendor_id
            AND is_active = '1';

            IF v_exists_vendor = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Vendor not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if company is exists
            SELECT COUNT(company_id) INTO v_exists_company
            FROM ms_company
            WHERE company_id = p_company_id
            AND is_active = '1';

            IF v_exists_company = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Company not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if user exists
            SELECT COUNT(user_id) INTO v_exists_user
            FROM ms_user
            WHERE user_id = p_user_id
            AND is_active = '1';

            -- if user not found then return 404
            IF v_exists_user = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'User not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE vendor_id = p_vendor_id
              AND company_id = p_company_id
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
                ${primaryKey}, company_id, vendor_id, created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_company_id, p_vendor_id, p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            vendor_company_id,
            vendor_id,
            company_id,
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

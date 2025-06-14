'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_vendor_beneficiary';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'vendor_beneficiary_id';
const model = 'Vendor Bank Beneficiary';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_vendor_id VARCHAR(50),
            IN p_bank_id VARCHAR(50),
            IN p_beneficiary_name VARCHAR(100),
            IN p_account_number VARCHAR(50),
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
            * 3. Check if bank exists, if not found then return 404
            * 4. Check if account number exists, if found then return 409
            * 5. Check for duplicates data by checking vendor_id AND bank_id AND beneficiary_name OR account_number, if found then return 409
            * 6. Generate ID using an existing function
            * 7. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_vendor INT; -- menampung variable untuk check vendor
            DECLARE v_exists_bank INT; -- menampung variable untuk check bank
            DECLARE v_exists_account_number INT; -- menampung variable untuk check account number

            -- Check if vendor exists
            SELECT COUNT(vendor_id) INTO v_exists_vendor
            FROM ms_vendor
            WHERE vendor_id = p_vendor_id
            AND is_active = '1';

            -- if vendor not found then return 404
            IF v_exists_vendor = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Vendor not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if bank exists
            SELECT COUNT(bank_id) INTO v_exists_bank
            FROM ms_bank
            WHERE bank_id = p_bank_id
            AND is_active = '1';

            -- if bank not found then return 404
            IF v_exists_bank = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Bank not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if account number exists
            SELECT COUNT(${primaryKey}) INTO v_exists_account_number
            FROM ${tableName}
            WHERE account_number = p_account_number
            AND is_active = '1';

            -- if account number is duplicated then return 409
            IF v_exists_account_number >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = 'Account Number Duplicated';

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
            WHERE (vendor_id = p_vendor_id
            AND bank_id = p_bank_id
            AND beneficiary_name = p_beneficiary_name)
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
                ${primaryKey}, vendor_id, bank_id, beneficiary_name, account_number,
                created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_vendor_id, p_bank_id, p_beneficiary_name, p_account_number,
                p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            vendor_beneficiary_id,
            vendor_id,
            bank_id,
            beneficiary_name,
            account_number,
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

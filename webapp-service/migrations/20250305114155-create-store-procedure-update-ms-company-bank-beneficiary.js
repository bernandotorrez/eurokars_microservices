'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_company_beneficiary';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'company_beneficiary_id';
const model = 'Company Beneficiary';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_company_id VARCHAR(50),
            IN p_bank_id VARCHAR(50),
            IN p_beneficiary_name VARCHAR(100),
            IN p_account_number VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';
            DECLARE v_exists_company INT;
            DECLARE v_exists_bank INT;
            DECLARE v_exists_user INT;
            DECLARE v_exists_account_number INT;
            DECLARE v_exists INT;

            -- Check if ${model} is exists
            SELECT COUNT(${primaryKey}) INTO v_exists
            FROM ${tableName}
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- if ${model} not found then return 404
            IF v_exists = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = '${model} not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if company exists
            SELECT COUNT(company_id) INTO v_exists_company
            FROM ms_company
            WHERE company_id = p_company_id
            AND is_active = '1';

            -- if company not found then return 404
            IF v_exists_company = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Company not found';

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

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE (company_id = p_company_id
            AND bank_id = p_bank_id
            AND beneficiary_name = p_beneficiary_name)
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
            SET company_id = p_company_id,
            bank_id = p_bank_id,
            beneficiary_name = p_beneficiary_name,
            account_number = p_account_number,
            updated_by = p_user_id,
            updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            company_beneficiary_id,
            company_id,
            bank_id,
            beneficiary_name,
            account_number,
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

'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_company';
const event = 'update';
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'company_id';
const model = 'Company';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_company_name VARCHAR(100),
            IN p_company_code CHAR(3),
            IN p_tax_id VARCHAR(25),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_exists INT;
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';

            -- Validate unique_id is not empty
            IF p_unique_id = '' THEN
                SET v_return_code = 400;
                SET v_return_message = 'ID ${model} Required';
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Validate unique_id exists in the database
            SELECT COUNT(${primaryKey}) INTO v_exists FROM ${tableName} WHERE unique_id = p_unique_id AND is_active = '1';
            IF v_exists = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = '${model} not found';
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates excluding the current unique_id
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE (company_name = p_company_name
            OR company_code = p_company_code
            OR tax_id = p_tax_id)
            AND unique_id <> p_unique_id
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = '${model} already Created';
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Update record
            UPDATE ${tableName}
            SET company_name = p_company_name,
                company_code = p_company_code,
                tax_id = p_tax_id,
                updated_by = p_user_id,
                updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and updated data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            company_id,
            company_name,
            company_code,
            tax_id,
            updated_date,
            updated_by,
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

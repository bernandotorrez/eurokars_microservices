'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_user_company_detail';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'user_company_detail_id';
const model = 'User Company Detail';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_user_param_id VARCHAR(50),
            IN p_company_detail_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-09] (Bernand Dayamuntari Hermawan) : Create Store Procedure Update ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if user param (user for company_detail) exists, if not found then return 404
            * 3. Check if company detail exists, if not found then return 404
            * 4. Update data
            */

            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_user_company_detail INT; -- menampung variable untuk check user (user for company_detail)
            DECLARE v_exists_company_detail INT; -- menampung variable untuk check company_detail

            -- Check if user company detail exists
            SELECT COUNT(user_id) INTO v_exists_user_company_detail
            FROM ms_user
            WHERE user_id = p_user_param_id
            AND is_active = '1';

            -- if user company_detail not found then return 404
            IF v_exists_user_company_detail = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'User not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if company detail exists
            SELECT COUNT(company_detail_id) INTO v_exists_company_detail
            FROM ms_company_detail
            WHERE company_detail_id = p_company_detail_id
            AND is_active = '1';

            -- if company_detail not found then return 404
            IF v_exists_company_detail = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Status app not found';

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

            -- Remove data by updating is_active to 0
            UPDATE ${tableName} SET is_active = '0',
              updated_by = p_user_id,
              updated_date = NOW()
            WHERE user_id = p_user_param_id
            AND company_detail_id = p_company_detail_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            ${primaryKey},
            user_id,
            company_detail_id,
            updated_by,
            updated_date,
            unique_id
            FROM ${tableName}
            WHERE user_id = p_user_param_id
            AND company_detail_id = p_company_detail_id
            AND is_active = '0'
            order by updated_date DESC
            LIMIT 1;

        END proc_label;

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

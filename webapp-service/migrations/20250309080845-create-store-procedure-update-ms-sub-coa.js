'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_sub_coa';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'sub_coa_id';
const model = 'Sub COA';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_coa_id VARCHAR(50),
            IN p_sub_coa_code VARCHAR(10),
            IN p_sub_coa_name VARCHAR(50),
            IN p_sub_coa_description VARCHAR(200),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-09] (Bernand Dayamuntari Hermawan) : Create Store Procedure Update ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if COA exists, if not found then return 404
            * 3. Check if ${model} exists, if not found then return 404
            * 4. Check for duplicates data by checking coa_id AND (sub_coa_name OR sub_coa_code), if found then return 409
            * 5. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_coa INT; -- menampung variable untuk check COA
            DECLARE v_exists INT; -- menampung variable untuk check ${model}

            -- Checl if ${model} is exists
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

            -- Check if COA exists
            SELECT COUNT(coa_id) INTO v_exists_coa
            FROM ms_coa
            WHERE coa_id = p_coa_id
            AND is_active = '1';

            -- if COA not found then return 404
            IF v_exists_coa = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'COA not found';

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
            WHERE coa_id = p_coa_id
            AND sub_coa_code = UPPER(p_sub_coa_code)
            AND sub_coa_name = p_sub_coa_name
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
            SET coa_id = p_coa_id,
            sub_coa_name = p_sub_coa_name,
            sub_coa_code = p_sub_coa_code,
            sub_coa_description = p_sub_coa_description,
            updated_by = p_user_id,
            updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            ${primaryKey},
            coa_id,
            sub_coa_name,
            sub_coa_code,
            sub_coa_description,
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

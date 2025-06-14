'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_user_role';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'user_role_id';
const model = 'User Role';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_user_param_id VARCHAR(50),
            IN p_role_id VARCHAR(50),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-09] (Bernand Dayamuntari Hermawan) : Create Store Procedure Add ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if user param (user for role) exists, if not found then return 404
            * 3. Check if role exists, if not found then return 404
            * 4. Check for duplicates data by checking (user_id AND role_id), if found then return 409
            * 5. Generate ID using an existing function
            * 6. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_user_role INT; -- menampung variable untuk check user (user for role)
            DECLARE v_exists_role INT; -- menampung variable untuk check role

            -- Check if user role exists
            SELECT COUNT(user_id) INTO v_exists_user_role
            FROM ms_user
            WHERE user_id = p_user_param_id
            AND is_active = '1';

            -- if user role not found then return 404
            IF v_exists_user_role = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'User not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if role exists
            SELECT COUNT(role_id) INTO v_exists_role
            FROM ms_role
            WHERE role_id = p_role_id
            AND is_active = '1';

            -- if role not found then return 404
            IF v_exists_role = 0 THEN
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

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE user_id = p_user_param_id
            AND role_id = p_role_id
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
                ${primaryKey}, user_id, role_id, created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_user_id, p_role_id, p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            ${primaryKey},
            user_id,
            role_id,
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

'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_role_permission';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'role_permission_id';
const model = 'Role Permission';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_menu_group_id VARCHAR(50),
            IN p_header_navigation_id VARCHAR(50),
            IN p_role_id VARCHAR(50),
            IN p_can_view ENUM('0','1'),
            IN p_can_add ENUM('0','1'),
            IN p_can_edit ENUM('0','1'),
            IN p_can_delete ENUM('0','1'),
            IN p_can_send ENUM('0','1'),
            IN p_can_approve ENUM('0','1'),
            IN p_can_reject ENUM('0','1'),
            IN p_can_report ENUM('0','1'),
            IN p_can_cancel ENUM('0','1'),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-08] (Bernand Dayamuntari Hermawan) : Create Store Procedure Add ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if menu group is exists, if not found then return 404
            * 3. Check if header navigation is exists, if not found then return 404
            * 4. Check if role is exists, if not found then return 404
            * 5. Check for duplicates data by checking (header_navigation_id AND menu_group_id AND role_id), if found then return 409
            * 6. Generate ID using an existing function
            * 7. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_menu_group INT; -- menampung variable untuk check menu group
            DECLARE v_exists_header_navigation INT; -- menampung variable untuk check header navigation
            DECLARE v_exists_role INT; -- menampung variable untuk check role

            -- Check if menu group is exists
            SELECT COUNT(menu_group_id) INTO v_exists_menu_group
            FROM ms_menu_group
            WHERE menu_group_id = p_menu_group_id
            AND is_active = '1';

            -- if menu group not found then return 404
            IF v_exists_menu_group = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Menu Group not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if header navigation is exists
            SELECT COUNT(header_navigation_id) INTO v_exists_header_navigation
            FROM ms_header_navigation
            WHERE header_navigation_id = p_header_navigation_id
            AND is_active = '1';

            -- if header navigation not found then return 404
            IF v_exists_header_navigation = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Header Navigation not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if role is exists
            SELECT COUNT(role_id) INTO v_exists_role
            FROM ms_role
            WHERE role_id = p_role_id
            AND is_active = '1';

            -- if role not found then return 404
            IF v_exists_role = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Role not found';

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
            WHERE header_navigation_id = p_header_navigation_id
            AND menu_group_id = p_menu_group_id
            AND role_id = p_role_id
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = '${model} already exists';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Generate ID using an existing function
            SELECT fn_gen_number(p_screen_id) INTO v_generated_id;

            -- Insert new data
            INSERT INTO ${tableName} (
                ${primaryKey}, header_navigation_id, menu_group_id, role_id,
                can_view, can_add, can_edit, can_delete,
                can_send, can_approve, can_reject, can_report, can_cancel,
                created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_header_navigation_id, p_menu_group_id, p_role_id,
                p_can_view, p_can_add, p_can_edit, p_can_delete,
                p_can_send, p_can_approve, p_can_reject, p_can_report, p_can_cancel,
                p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            ${primaryKey},
            header_navigation_id,
            menu_group_id,
            role_id,
            can_view,
            can_add,
            can_edit,
            can_delete,
            can_send,
            can_approve,
            can_reject,
            can_report,
            can_cancel,
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

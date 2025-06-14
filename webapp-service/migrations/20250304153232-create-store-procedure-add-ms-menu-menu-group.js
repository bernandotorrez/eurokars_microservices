'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_menu_menu_group';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'menu_menu_group_id';
const model = 'Menu Menu Group';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_menu_group_id VARCHAR(50),
            IN p_header_navigation_id VARCHAR(50),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_generated_id VARCHAR(50);
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';
            DECLARE v_exists_menu_group INT;
            DECLARE v_exist_header_navigation INT;

            -- Check if menu group is exists
            SELECT COUNT(menu_group_id) INTO v_exists_menu_group
            FROM ms_menu_group
            WHERE menu_group_id = p_menu_group_id
            AND is_active = '1';

            IF v_exists_menu_group = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Menu Group not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if header navigation is exists
            SELECT COUNT(header_navigation_id) INTO v_exist_header_navigation
            FROM ms_header_navigation
            WHERE header_navigation_id = p_header_navigation_id
            AND is_active = '1';

            IF v_exist_header_navigation = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Header Navigation not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE menu_group_id = p_menu_group_id
              AND header_navigation_id = p_header_navigation_id
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
                ${primaryKey}, menu_group_id, header_navigation_id, created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_menu_group_id, p_header_navigation_id, p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            menu_menu_group_id,
            menu_group_id,
            header_navigation_id,
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

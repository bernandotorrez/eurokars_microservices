'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_menu_menu_group';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'menu_menu_group_id';
const model = 'Menu Menu Group';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_menu_group_id VARCHAR(50),
            IN p_header_navigation_id VARCHAR(50)
        )
        proc_label: BEGIN
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

            -- Remove data by updating is_active to 0
            UPDATE ${tableName} SET is_active = '0',
              updated_by = p_user_id,
              updated_date = NOW()
            WHERE menu_group_id = p_menu_group_id
            AND header_navigation_id = p_header_navigation_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            menu_menu_group_id,
            menu_group_id,
            header_navigation_id,
            updated_by,
            updated_date,
            unique_id
            FROM ${tableName}
            WHERE menu_group_id = p_menu_group_id
            AND header_navigation_id = p_header_navigation_id
            AND is_active = '0'
            LIMIT 1;

        END proc_label;

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

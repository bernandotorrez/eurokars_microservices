'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_user_status_app';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'user_status_app_id';
const model = 'User Status App';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_user_param_id VARCHAR(50),
            IN p_status_app_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-08] (Bernand Dayamuntari Hermawan) : Create Store Procedure Update ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if user parma (user for status app) exists, if not found then return 404
            * 3. Check if status app exists, if not found then return 404
            * 4. Update data
            */

            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_user_status_app INT; -- menampung variable untuk check user (user for status app)
            DECLARE v_exists_status_app INT; -- menampung variable untuk check status app

            -- Check if user status app exists
            SELECT COUNT(user_id) INTO v_exists_user_status_app
            FROM ms_user
            WHERE user_id = p_user_param_id
            AND is_active = '1';

            -- if user status app not found then return 404
            IF v_exists_user_status_app = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'User not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if status app exists
            SELECT COUNT(status_app_id) INTO v_exists_status_app
            FROM ms_status_app
            WHERE status_app_id = p_status_app_id
            AND is_active = '1';

            -- if status app not found then return 404
            IF v_exists_status_app = 0 THEN
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
            AND status_app_id = p_status_app_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            ${primaryKey},
            user_id,
            status_app_id,
            updated_by,
            updated_date,
            unique_id
            FROM ${tableName}
            WHERE user_id = p_user_param_id
            AND status_app_id = p_status_app_id
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

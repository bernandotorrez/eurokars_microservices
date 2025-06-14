'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_menu_group';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'menu_group_id';
const model = 'Menu Group';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_menu_group_code VARCHAR(10),
            IN p_menu_group_name VARCHAR(50),
            IN p_menu_group_description VARCHAR(200),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';
            DECLARE v_exists INT;

            -- Validasi ID tidak boleh kosong dan harus ada di database
            IF p_unique_id = '' THEN
                SET v_return_code = 400;
                SET v_return_message = 'ID ${model} Required';

                -- Return error code and message
                SELECT
                    v_return_code AS return_code,
                    v_return_message AS return_message,
                    NULL AS data;

                -- Exit the procedure
                LEAVE proc_label;
            END IF;

            -- Validasi ID harus ada di database
            SELECT COUNT(${primaryKey}) INTO v_exists FROM ${tableName} WHERE unique_id = p_unique_id;
            IF v_exists = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = '${model} not found';

                -- Return error code and message
                SELECT
                    v_return_code AS return_code,
                    v_return_message AS return_message,
                    NULL AS data;

                -- Exit the procedure
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE (menu_group_code = p_menu_group_code
              OR menu_group_name = p_menu_group_name)
              AND unique_id <> p_unique_id;

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = '${model} already Created';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Update Data
            UPDATE ${tableName} SET
                menu_group_name = p_menu_group_name,
                menu_group_code = p_menu_group_code,
                menu_group_description = p_menu_group_description,
                updated_by = p_user_id,
                updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            menu_group_id,
            menu_group_name,
            menu_group_code,
            menu_group_description,
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

'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_status_app';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'status_app_id';
const model = 'Status App';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_status_app_name VARCHAR(50),
            IN p_redirect_url VARCHAR(200),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
            DECLARE v_duplicate_count INT;
            DECLARE v_exists INT;
            DECLARE v_return_code INT DEFAULT 200;
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';

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
            SELECT COUNT(${primaryKey}) INTO v_exists FROM ${tableName} WHERE unique_id = p_unique_id AND is_active = '1';
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

            -- Cek duplikasi kecuali ID yang sedang diubah
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE (status_app_name = p_status_app_name OR redirect_url = p_redirect_url)
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
            SET status_app_name = p_status_app_name,
                redirect_url = p_redirect_url,
                updated_by = p_user_id,
                updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return Data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            status_app_id,
            status_app_name,
            redirect_url,
            updated_date,
            updated_by,
            unique_id FROM ${tableName} WHERE unique_id = p_unique_id
            AND is_active = '1'
            LIMIT 1;

        END proc_label;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

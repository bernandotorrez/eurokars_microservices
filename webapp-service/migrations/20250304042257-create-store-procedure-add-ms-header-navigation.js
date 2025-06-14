'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_header_navigation';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'header_navigation_id';
const model = 'Header Navigation';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_parent_id VARCHAR(50),
            IN p_header_navigation_name VARCHAR(255),
            IN p_sort_number INT,
            IN p_url VARCHAR(255),
            IN p_remark TEXT,
            IN p_is_other_sidebar CHAR(1),
            IN p_level VARCHAR(10),
            IN p_screen_id VARCHAR(50),
            IN p_screen_id_input VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN
          DECLARE v_duplicate_count INT;
          DECLARE v_parent_level INT;
          DECLARE v_generated_id VARCHAR(50);
          DECLARE v_is_parent_exist INT;
          DECLARE v_return_code INT DEFAULT 200;
          DECLARE v_return_message VARCHAR(255) DEFAULT 'Success';

          -- Check duplicates
          IF p_level = '1' THEN
              SELECT COUNT(${primaryKey}) INTO v_duplicate_count
              FROM ms_header_navigation
              WHERE header_navigation_name = p_header_navigation_name
                OR screen_id = p_screen_id_input;
          ELSE
              SELECT COUNT(${primaryKey}) INTO v_duplicate_count
              FROM ms_header_navigation
              WHERE (header_navigation_name = p_header_navigation_name
                OR screen_id = p_screen_id_input
                OR url = p_url)
                AND url <> '#';
          END IF;

          IF v_duplicate_count >= 1 THEN
              SET v_return_code = 409;
              SET v_return_message = 'Data already Created';

              -- Return error code and message
              SELECT
                  v_return_code AS return_code,
                  v_return_message AS return_message,
                  NULL AS data;

              -- Exit the procedure
              LEAVE proc_label;
          END IF;

          -- Check Parent Menu is Exist (only if parent_id is provided)
          IF p_parent_id IS NOT NULL AND p_parent_id <> '' THEN
              SELECT COUNT(${primaryKey}) INTO v_is_parent_exist
              FROM ms_header_navigation
              WHERE ${primaryKey} = p_parent_id;

              IF v_is_parent_exist = 0 THEN
                  SET v_return_code = 404;
                  SET v_return_message = 'Parent not found';

                  -- Return error code and message
                  SELECT
                      v_return_code AS return_code,
                      v_return_message AS return_message,
                      NULL AS data;

                  -- Exit the procedure
                  LEAVE proc_label;
              END IF;

              -- Level validation (moved inside parent check since it's only relevant if parent exists)
              SELECT level INTO v_parent_level
              FROM ms_header_navigation
              WHERE ${primaryKey} = p_parent_id;

              IF p_level <= v_parent_level THEN
                  SET v_return_code = 400;
                  SET v_return_message = 'Level Menu must be less than Parent Level Menu';

                  -- Return error code and message
                  SELECT
                      v_return_code AS return_code,
                      v_return_message AS return_message,
                      NULL AS data;

                  -- Exit the procedure
                  LEAVE proc_label;
              END IF;
          END IF;

          -- Generate ID
          SELECT fn_gen_number(p_screen_id) INTO v_generated_id;

          -- Insert new record
          INSERT INTO ms_header_navigation (
              ${primaryKey},
              parent_id,
              header_navigation_name,
              sort_number,
              url,
              remark,
              is_other_sidebar,
              level,
              screen_id,
              created_by,
              created_date,
              unique_id
          ) VALUES (
              v_generated_id,
              p_parent_id,
              p_header_navigation_name,
              p_sort_number,
              p_url,
              p_remark,
              p_is_other_sidebar,
              p_level,
              p_screen_id_input,
              p_user_id,
              NOW(),
              p_unique_id
          );

          -- Return success code, message, and data
          SELECT
              v_return_code AS return_code,
              v_return_message AS return_message,
              ${primaryKey},
              parent_id,
              header_navigation_name,
              sort_number,
              url,
              remark,
              is_other_sidebar,
              level,
              screen_id,
              created_by,
              created_date,
              unique_id
          FROM ms_header_navigation
          WHERE ${primaryKey} = v_generated_id
          AND is_active = '1'
          LIMIT 1;

      END proc_label;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

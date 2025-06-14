'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_budget';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'budget_id';
const model = 'Budget';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_company_detail_id VARCHAR(50),
            IN p_year CHAR(4),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

          /* Changelog :
          * v1 : [2025-03-09] (Bernand Dayamuntari Hermawan) : Create Store Procedure Add ${tableName}
          */

          /* Flow :
          * 1. Check if user exists, if not found then return 404
          * 2. Check if company detail exists, if not found then return 404
          * 3. Check for duplicates data by checking company_detail_id AND year, if found then return 409
          * 4. Generate Budget Code using an existing fn_generate_budget_code
          * 5. Generate ID using an existing function
          * 6. Insert data
          */

          DECLARE v_duplicate_count INT DEFAULT 0; -- menampung variable untuk check duplicate data
          DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
          DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
          DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
          DECLARE v_exists_user INT DEFAULT 0; -- menampung variable untuk check user
          DECLARE v_exists_company_detail INT DEFAULT 0; -- menampung variable untuk check COA
          DECLARE v_company_code CHAR(3); -- menampung variable untuk company code
          DECLARE v_budget_code VARCHAR(20); -- menampung variable untuk budget code

         -- Check if company detail exists
          SELECT COUNT(company_detail_id) INTO v_exists_company_detail
          FROM ms_company_detail
          WHERE company_detail_id = p_company_detail_id
          AND is_active = '1';

          -- If company detail not found, return 404
          IF v_exists_company_detail = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'COA not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Get the company_code from ms_company
          SELECT ms_company.company_code INTO v_company_code
          FROM ms_company_detail
          INNER JOIN ms_company ON ms_company.company_id = ms_company_detail.company_id
          WHERE ms_company_detail.company_detail_id = p_company_detail_id
          AND ms_company.is_active = '1'
          AND ms_company_detail.is_active = '1';

          -- If company code not found, return 404
          IF v_company_code IS NULL THEN
              SET v_return_code = 404;
              SET v_return_message = 'Company not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Call function fn_generate_budget_code
          SELECT fn_generate_budget_code(v_company_code, p_year) INTO v_budget_code;

          -- Check if user exists
          SELECT COUNT(user_id) INTO v_exists_user
          FROM ms_user
          WHERE user_id = p_user_id
          AND is_active = '1';

          IF v_exists_user = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'User not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check for duplicate data
          SELECT COUNT(${primaryKey}) INTO v_duplicate_count
          FROM ${tableName}
          WHERE budget_code = v_budget_code
          OR (company_detail_id = p_company_detail_id
          AND year = p_year)
          AND is_active = '1';

          IF v_duplicate_count > 0 THEN
              SET v_return_code = 409;
              SET v_return_message = '${model} already Created';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Generate ID using function
          SELECT fn_gen_number(p_screen_id) INTO v_generated_id;

          -- Insert new data
          INSERT INTO ${tableName} (
              ${primaryKey}, company_detail_id, budget_code, year, created_by, created_date, unique_id
          ) VALUES (
              v_generated_id, p_company_detail_id, v_budget_code, p_year, p_user_id, NOW(), p_unique_id
          );

          -- Return success response with inserted data
          SELECT v_return_code AS return_code, v_return_message AS return_message,
                ${primaryKey}, company_detail_id, budget_code, year, created_by, created_date, unique_id
          FROM ${tableName}
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

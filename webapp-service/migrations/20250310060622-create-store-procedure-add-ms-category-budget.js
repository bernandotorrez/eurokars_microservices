'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_category_budget';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'category_budget_id';
const model = 'Category Budget';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_budget_id VARCHAR(50),
            IN p_sub_coa_id VARCHAR(50),
            IN p_business_line_id VARCHAR(50),
            IN p_sub_business_line_1_id VARCHAR(50),
            IN p_sub_business_line_2_id VARCHAR(50),
            IN p_category_budget_name VARCHAR(200),
            IN p_total_category_budget DECIMAL(20,2),
            IN p_opex_capex ENUM('OpexRoutine', 'OpexNonRoutine', 'Capex'),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

          /* Changelog :
          * v1 : [2025-03-10] (Bernand Dayamuntari Hermawan) : Create Store Procedure Add ${tableName}
          */

          /* Flow :
          * 1. Check if user exists, if not found then return 404
          * 2. Check if budget exists, if not found then return 404
          * 3. Check if Sub COA exists, if not found then return 404
          * 4. Check if Sub Business Line 1 exists, if not found then return 404
          * 5. Check if Sub Business Line 2 exists, if not found then return 404
          * 6. Check for duplicates data by checking budget_id AND sub_coa_id AND business_line_id
          *     AND sub_business_line_1_id AND sub_business_line_2_id AND category_budget_name, if found then return 409
          * 7. Generate Budget Code using an function fn_generate_category_category_budget_code
          * 8. Generate ID using an function fn_gen_number
          * 9. Insert data
          */

          DECLARE v_duplicate_count INT DEFAULT 0; -- menampung variable untuk check duplicate data
          DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
          DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
          DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
          DECLARE v_exists_user INT DEFAULT 0; -- menampung variable untuk check user
          DECLARE v_exists_budget INT DEFAULT 0; -- menampung variable untuk check Budget
          DECLARE v_exists_sub_coa INT DEFAULT 0; -- menampung variable untuk check Sub COA
          DECLARE v_exists_business_line INT DEFAULT 0; -- menampung variable untuk check Business Line
          DECLARE v_exists_sub_business_line_1 INT DEFAULT 0; -- menampung variable untuk check Sub Business Line 1
          DECLARE v_exists_sub_business_line_2 INT DEFAULT 0; -- menampung variable untuk check Sub Business Line 2
          DECLARE v_company_code CHAR(3); -- menampung variable untuk company code
          DECLARE v_department_code VARCHAR(3); -- menampung variable untuk department code
          DECLARE v_category_budget_code VARCHAR(20); -- menampung variable untuk category budget code
          DECLARE v_year CHAR(4); -- menampung variable untuk year

         -- Check if budget exists
          SELECT COUNT(budget_id) INTO v_exists_budget
          FROM ms_budget
          WHERE budget_id = p_budget_id
          AND is_active = '1';

          -- If budget not found, return 404
          IF v_exists_budget = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Budget not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Get Year Budget
          SELECT year INTO v_year
          FROM ms_budget
          WHERE budget_id = p_budget_id
          AND is_active = '1'
          LIMIT 1;

          -- Check if Sub COA exists
          SELECT COUNT(sub_coa_id) INTO v_exists_sub_coa
          FROM ms_sub_coa
          WHERE sub_coa_id = p_sub_coa_id
          AND is_active = '1';

          -- If Sub COA not found, return 404
          IF v_exists_sub_coa = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Sub COA not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if Business Line exists
          SELECT COUNT(business_line_id) INTO v_exists_business_line
          FROM ms_business_line
          WHERE business_line_id = p_business_line_id
          AND is_active = '1';

          -- If Business Line not found, return 404
          IF v_exists_business_line = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Business Line not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if Sub Business Line 1 exists
          SELECT COUNT(sub_business_line_1_id) INTO v_exists_sub_business_line_1
          FROM ms_sub_business_line_1
          WHERE sub_business_line_1_id = p_sub_business_line_1_id
          AND is_active = '1';

          -- If Sub Business Line 1 not found, return 404
          IF v_exists_sub_business_line_1 = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Sub Business Line 1 not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if Sub Business Line 2 exists
          SELECT COUNT(sub_business_line_2_id) INTO v_exists_sub_business_line_2
          FROM ms_sub_business_line_2
          WHERE sub_business_line_2_id = p_sub_business_line_2_id
          AND is_active = '1';

          -- If Sub Business Line 2 not found, return 404
          IF v_exists_sub_business_line_2 = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Sub Business Line 2 not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Get the company_code from ms_company
          SELECT mc.company_code INTO v_company_code
          FROM ms_budget mb
          INNER JOIN ms_company_detail mcd ON mcd.company_detail_id = mb.company_detail_id
          INNER JOIN ms_company mc ON mc.company_id = mcd.company_id
          WHERE mb.is_active = '1'
          AND mcd.is_active = '1'
          AND mc.is_active = '1'
          AND mb.budget_id = p_budget_id
          LIMIT 1;

          -- If company code not found, return 404
          IF v_company_code IS NULL THEN
              SET v_return_code = 404;
              SET v_return_message = 'Company not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Get the department_code from ms_department
          SELECT md.department_code INTO v_department_code
          FROM ms_budget mb
          INNER JOIN ms_company_detail mcd ON mcd.company_detail_id = mb.company_detail_id
          INNER JOIN ms_department md ON mcd.department_id = md.department_id
          WHERE mb.is_active = '1'
          AND mcd.is_active = '1'
          AND md.is_active = '1'
          AND mb.budget_id = p_budget_id
          LIMIT 1;

          -- If department code not found, return 404
          IF v_department_code IS NULL THEN
              SET v_return_code = 404;
              SET v_return_message = 'Department not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Call function fn_generate_category_budget_code
          SELECT fn_generate_category_budget_code(v_company_code, v_department_code, v_year) INTO v_category_budget_code;

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
          WHERE category_budget_code = v_category_budget_code
          OR (budget_id = p_budget_id
          AND sub_coa_id = p_sub_coa_id
          AND business_line_id = p_business_line_id
          AND sub_business_line_1_id = p_sub_business_line_1_id
          AND sub_business_line_2_id = p_sub_business_line_2_id
          AND category_budget_name = p_category_budget_name)
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
              ${primaryKey}, budget_id, sub_coa_id, business_line_id, sub_business_line_1_id,
              sub_business_line_2_id, category_budget_code, category_budget_name,
              total_category_budget, total_opening_category_budget, remaining_submit, remaining_actual, opex_capex,
              created_by, created_date, unique_id
          ) VALUES (
              v_generated_id, p_budget_id, p_sub_coa_id, p_business_line_id, p_sub_business_line_1_id,
              p_sub_business_line_2_id, v_category_budget_code, p_category_budget_name,
              p_total_category_budget, p_total_category_budget, p_total_category_budget, p_total_category_budget, p_opex_capex, p_user_id, NOW(), p_unique_id
          );

          -- Return success response with inserted data
          SELECT v_return_code AS return_code, v_return_message AS return_message,
                ${primaryKey}, budget_id, sub_coa_id, business_line_id, sub_business_line_1_id,
              sub_business_line_2_id, category_budget_code, category_budget_name,
              total_category_budget, total_opening_category_budget, remaining_submit, remaining_actual, opex_capex,
              created_by, created_date, unique_id
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

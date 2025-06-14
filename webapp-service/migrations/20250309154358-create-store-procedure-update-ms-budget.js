'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_budget';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'budget_id';
const model = 'Budget';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_company_id VARCHAR(50),
            IN p_brand_id VARCHAR(50),
            IN p_branch_id VARCHAR(50),
            IN p_department_id VARCHAR(50),
            IN p_year CHAR(4),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

        /* Changelog :
          * v1 : [2025-03-09] (Bernand Dayamuntari Hermawan) : Create Store Procedure Update ${tableName}
          */

          /* Flow :
          * 1. Check if user exists, if not found then return 404
          * 2. Check if company exists, if not found then return 404
          * 3. Check if brand exists, if not found then return 404
          * 4. Check if branch exists, if not found then return 404
          * 5. Check if department exists, if not found then return 404
          * 6. Check if ${model} exists, if not found then return 404
          * 7. Check if ${model} have Category Budget, if found then return 422
          * 8. Check for duplicates data by checking company_id, brand_id, branch_id, department_id, AND year, if found then return 409
          * 9. Generate Budget Code using an existing fn_generate_budget_code
          * 10. Generate ID using an existing function
          * 11. Update data
          */

          DECLARE v_duplicate_count INT DEFAULT 0; -- menampung variable untuk check duplicate data
          DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
          DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
          DECLARE v_exists_user INT DEFAULT 0; -- menampung variable untuk check user
          DECLARE v_company_code CHAR(3); -- menampung variable untuk company code
          DECLARE v_year CHAR(2); -- menampung variable untuk current year
          DECLARE v_budget_number INT; -- menampung variable untuk budget number
          DECLARE v_formatted_budget_number VARCHAR(4); -- menampung variable untuk formatted budget number
          DECLARE v_budget_code VARCHAR(20); -- menampung variable untuk budget code
          DECLARE v_exists INT; -- menampung variable untuk check data ${model}
          DECLARE v_existing_year CHAR(4); -- menampung variable untuk year existing
          DECLARE v_existing_company_id VARCHAR(50); -- menampung variable untuk company existing
          DECLARE v_existing_budget_code VARCHAR(20); -- menampung variable untuk budget code existing
          DECLARE v_count_category_budget INT DEFAULT 0; -- menampung variable untuk count category budget
          DECLARE v_exists_company INT DEFAULT 0; -- menampung variable untuk check Company
          DECLARE v_exists_brand INT DEFAULT 0; -- menampung variable untuk check Brand
          DECLARE v_exists_branch INT DEFAULT 0; -- menampung variable untuk check Branch
          DECLARE v_exists_department INT DEFAULT 0; -- menampung variable untuk check Department

          -- Check if ${model} exists
          SELECT COUNT(${primaryKey}) INTO v_exists
          FROM ${tableName}
          WHERE unique_id = p_unique_id
          AND is_active = '1';

          -- If ${model} not found, return 404
          IF v_exists = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = '${model} not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if company exists
          SELECT COUNT(company_id) INTO v_exists_company
          FROM ms_company
          WHERE company_id = p_company_id
          AND is_active = '1';

          -- If company not found, return 404
          IF v_exists_company = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Company not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if brand exists
          SELECT COUNT(brand_id) INTO v_exists_brand
          FROM ms_brand
          WHERE brand_id = p_brand_id
          AND is_active = '1';

          -- If brand not found, return 404
          IF v_exists_brand = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Brand not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if branch exists
          SELECT COUNT(branch_id) INTO v_exists_branch
          FROM ms_branch
          WHERE branch_id = p_branch_id
          AND is_active = '1';

          -- If branch not found, return 404
          IF v_exists_branch = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Branch not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Check if department exists
          SELECT COUNT(department_id) INTO v_exists_department
          FROM ms_department
          WHERE department_id = p_department_id
          AND is_active = '1';

          -- If department not found, return 404
          IF v_exists_department = 0 THEN
              SET v_return_code = 404;
              SET v_return_message = 'Department not found';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Count budget have category
          SELECT COUNT(mb.budget_id) INTO v_count_category_budget
          FROM ms_budget mb
          INNER JOIN ms_category_budget mcb ON mcb.budget_id = mb.budget_id
          WHERE mb.unique_id = p_unique_id
          AND mcb.is_active = '1';

          IF v_count_category_budget > 0 THEN
              SET v_return_code = 422;
              SET v_return_message = 'Cannot update Budget because it has Category';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

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
          WHERE (budget_code = v_budget_code
          OR (company_id = p_company_id
          AND brand_id = p_brand_id
          AND branch_id = p_branch_id
          AND department_id = p_department_id
          AND year = p_year))
          AND unique_id <> p_unique_id
          AND is_active = '1';

          IF v_duplicate_count > 0 THEN
              SET v_return_code = 409;
              SET v_return_message = '${model} already Created';
              SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
              LEAVE proc_label;
          END IF;

          -- Get Current Data
          SELECT company_id, year, budget_code
          INTO v_existing_company_id, v_existing_year, v_existing_budget_code
          FROM ${tableName}
          WHERE unique_id = p_unique_id
          AND is_active = '1';

          -- Check perubahan data, kalau tidak ada yang berubah maka tidak perlu generate budget code
          IF p_company_id = v_existing_company_id
          AND p_year = v_existing_year THEN
              -- Update data
              UPDATE ${tableName}
              SET company_id = p_company_id,
                  brand_id = p_brand_id,
                  branch_id = p_branch_id,
                  department_id = p_department_id,
                  year = p_year,
                  updated_by = p_user_id,
                  updated_date = NOW()
              WHERE unique_id = p_unique_id
              AND is_active = '1';
          ELSE

              -- Get the company_code from ms_company
              SELECT ms_company.company_code INTO v_company_code
              FROM ms_company
              WHERE ms_company.company_id = p_company_id
              AND ms_company.is_active = '1'
              LIMIT 1;

              -- If company code not found, return 404
              IF v_company_code IS NULL THEN
                  SET v_return_code = 404;
                  SET v_return_message = 'Company not found';
                  SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                  LEAVE proc_label;
              END IF;

               -- Call function fn_generate_budget_code
              SELECT fn_generate_budget_code(v_company_code, p_year) INTO v_budget_code;

              -- Update data
              UPDATE ${tableName}
              SET company_id = p_company_id,
                  brand_id = p_brand_id,
                  branch_id = p_branch_id,
                  department_id = p_department_id,
                  year = p_year,
                  budget_code = v_budget_code,
                  updated_by = p_user_id,
                  updated_date = NOW()
              WHERE unique_id = p_unique_id
              AND is_active = '1';
          END IF;

          -- Return success response with inserted data
          SELECT v_return_code AS return_code, v_return_message AS return_message,
                ${primaryKey}, company_id, brand_id, branch_id, department_id,
                budget_code, year, updated_by, updated_date, unique_id
          FROM ${tableName}
          WHERE unique_id = p_unique_id
          AND is_active = '1'
          LIMIT 1;

        END proc_label;

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

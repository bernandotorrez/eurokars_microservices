'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_company_detail';
const event = 'update'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'company_detail_id';
const model = 'Company Detail';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_company_id VARCHAR(50),
            IN p_brand_id VARCHAR(50),
            IN p_branch_id VARCHAR(50),
            IN p_department_id VARCHAR(50),
            IN p_division_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-07] (Bernand Dayamuntari Hermawan) : Create Store Procedure Update ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if company exists, if not found then return 404
            * 3. Check if brand exists, if not found then return 404
            * 4. Check if branch exists, if not found then return 404
            * 5. Check if department exists, if not found then return 404
            * 6. Check if division exists, if not found then return 404
            * 7. Check if ${model} exists, if not found then return 404
            * 8. Check for duplicates data by checking company_id AND brand_id AND branch_id AND department_id AND division_id, if found then return 409
            * 9. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists_company INT; -- menampung variable untuk check company
            DECLARE v_exists_brand INT; -- menampung variable untuk check brand
            DECLARE v_exists_branch INT; -- menampung variable untuk check branch
            DECLARE v_exists_department INT; -- menampung variable untuk check department
            DECLARE v_exists_division INT; -- menampung variable untuk check division
            DECLARE v_exists INT; -- menampung variable untuk check ${model}

            -- Check if ${model} is exists
            SELECT COUNT(${primaryKey}) INTO v_exists
            FROM ${tableName}
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- if ${model} not found then return 404
            IF v_exists = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = '${model} not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if company exists
            SELECT COUNT(company_id) INTO v_exists_company
            FROM ms_company
            WHERE company_id = p_company_id
            AND is_active = '1';

            -- if company not found then return 404
            IF v_exists_company = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Company not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if brand exists
            SELECT COUNT(brand_id) INTO v_exists_brand
            FROM ms_brand
            WHERE brand_id = p_brand_id
            AND is_active = '1';

            -- if brand not found then return 404
            IF v_exists_brand = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Brand not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if branch exists
            SELECT COUNT(branch_id) INTO v_exists_branch
            FROM ms_branch
            WHERE branch_id = p_branch_id
            AND is_active = '1';

            -- if branch not found then return 404
            IF v_exists_branch = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Branch not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if department exists
            SELECT COUNT(department_id) INTO v_exists_department
            FROM ms_department
            WHERE department_id = p_department_id
            AND is_active = '1';

            -- if department not found then return 404
            IF v_exists_department = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Department not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check if division exists
            SELECT COUNT(division_id) INTO v_exists_division
            FROM ms_division
            WHERE division_id = p_division_id
            AND is_active = '1';

            -- if division not found then return 404
            IF v_exists_division = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'Division not found';

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
            WHERE company_id = p_company_id
            AND brand_id = p_brand_id
            AND branch_id = p_branch_id
            AND department_id = p_department_id
            AND division_id = p_division_id
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
            SET company_id = p_company_id,
            brand_id = p_brand_id,
            branch_id = p_branch_id,
            department_id = p_department_id,
            division_id = p_division_id,
            updated_by = p_user_id,
            updated_date = NOW()
            WHERE unique_id = p_unique_id;

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            ${primaryKey},
            company_id,
            brand_id,
            branch_id,
            department_id,
            division_id,
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

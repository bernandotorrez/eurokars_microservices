'use strict';

/** @type {import('sequelize-cli').Migration} */
const fnName = 'fn_generate_budget_code';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE FUNCTION ${fnName}(
            p_company_code CHAR(3),
            p_year CHAR(4)
        ) RETURNS VARCHAR(20)
        DETERMINISTIC
        READS SQL DATA
        BEGIN

            /* Changelog :
            * v1 : [2025-03-09] (Bernand Dayamuntari Hermawan) : Create Function Generate Budget Code
            */

            /* Flow :
            * 1. Get 2 last digits of the year
            * 2. Get the last used budget number
            * 3. If no existing budget_code is found, start from 1
            * 4. Format the budget number to 4 digits
            * 5. Return Generated the budget code, example : B-EAU-25-0001 which EAU = Company Code, 25 = Year, 0001 = Budget Sequence
            */

            DECLARE v_year CHAR(2); -- Variable for the last 2 digits of the year
            DECLARE v_budget_number INT DEFAULT 0; -- Default to 0 in case of NULL
            DECLARE v_formatted_budget_number CHAR(4); -- Formatted sequence number
            DECLARE v_budget_code VARCHAR(20); -- Stores the generated budget code

            -- Extract the last 2 digits of the year
            SET v_year = RIGHT(p_year, 2);

            -- Get the last used budget number
            SELECT RIGHT(budget_code, 4) INTO v_budget_number
            FROM ms_budget
            WHERE budget_code LIKE CONCAT('%', UPPER(p_company_code), '-', v_year, '%')
            ORDER BY budget_code DESC
            LIMIT 1;

            -- If no existing budget_code is found, start from 1
            IF v_budget_number IS NULL THEN
                SET v_budget_number = 1;
            ELSE
                SET v_budget_number = v_budget_number + 1;
            END IF;

            -- Format the budget number to 4 digits
            SET v_formatted_budget_number = LPAD(v_budget_number, 4, '0');

            -- Generate the budget code
            SET v_budget_code = CONCAT('B-', UPPER(p_company_code), '-', v_year, '-', v_formatted_budget_number);

            RETURN v_budget_code;
        END

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS ${fnName}`);
  }
};

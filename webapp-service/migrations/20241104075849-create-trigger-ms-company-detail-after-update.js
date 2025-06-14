'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'tg_ms_company_detail_AFTER_UPDATE';
const primaryKey = 'company_detail_id';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
      AFTER UPDATE ON ms_company_detail
      FOR EACH ROW
      BEGIN
        DECLARE v_screen_id VARCHAR(50);
        DECLARE v_old_response LONGTEXT;
        DECLARE v_new_response LONGTEXT;

        -- Get Screen ID
        SET v_screen_id = SUBSTRING_INDEX(OLD.${primaryKey}, '-', 1);

        -- Generate Old Response (Safely formatted JSON string)
        SET v_old_response = CONCAT(
          '{', CHAR(10),
          '  "company_id": "', IFNULL(OLD.company_id, ''), '",', CHAR(10),
          '  "brand_id": "', IFNULL(OLD.brand_id, ''), '",', CHAR(10),
          '  "branch_id": "', IFNULL(OLD.branch_id, ''), '",', CHAR(10),
          '  "department_id": "', IFNULL(OLD.department_id, ''), '",', CHAR(10),
          '  "division_id": "', IFNULL(OLD.division_id, ''), '",', CHAR(10),
          '  "created_date": "', IFNULL(OLD.created_date, ''), '",', CHAR(10),
          '  "created_by": "', IFNULL(OLD.created_by, ''), '",', CHAR(10),
          '  "updated_date": "', IFNULL(OLD.updated_date, ''), '",', CHAR(10),
          '  "updated_by": "', IFNULL(OLD.updated_by, ''), '",', CHAR(10),
          '  "unique_id": "', IFNULL(OLD.unique_id, ''), '",', CHAR(10),
          '  "is_active": "', IFNULL(OLD.is_active, ''), '"', CHAR(10),
          '}'
        );

        -- Generate New Response
        SET v_new_response = CONCAT(
          '{', CHAR(10),
          '  "company_id": "', IFNULL(NEW.company_id, ''), '",', CHAR(10),
          '  "brand_id": "', IFNULL(NEW.brand_id, ''), '",', CHAR(10),
          '  "branch_id": "', IFNULL(NEW.branch_id, ''), '",', CHAR(10),
          '  "department_id": "', IFNULL(NEW.department_id, ''), '",', CHAR(10),
          '  "division_id": "', IFNULL(NEW.division_id, ''), '",', CHAR(10),
          '  "created_date": "', IFNULL(NEW.created_date, ''), '",', CHAR(10),
          '  "created_by": "', IFNULL(NEW.created_by, ''), '",', CHAR(10),
          '  "updated_date": "', IFNULL(NEW.updated_date, ''), '",', CHAR(10),
          '  "updated_by": "', IFNULL(NEW.updated_by, ''), '",', CHAR(10),
          '  "unique_id": "', IFNULL(NEW.unique_id, ''), '",', CHAR(10),
          '  "is_active": "', IFNULL(NEW.is_active, ''), '"', CHAR(10),
          '}'
        );

        -- Insert Into Audit Trail Log
        IF NEW.is_active = '0' THEN
          INSERT INTO ad_trail_log_master_data (
            user_id,
            module,
            old_response,
            new_response,
            execution_type,
            executed_at
          )
          VALUES (
            NEW.updated_by,
            v_screen_id,
            v_old_response,
            v_new_response,
            'DELETE',
            NEW.updated_date
          );
        ELSE
          INSERT INTO ad_trail_log_master_data (
            user_id,
            module,
            old_response,
            new_response,
            execution_type,
            executed_at
          )
          VALUES (
            NEW.updated_by,
            v_screen_id,
            v_old_response,
            v_new_response,
            'UPDATE',
            NEW.updated_date
          );
        END IF;
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

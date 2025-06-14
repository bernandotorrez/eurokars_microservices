'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'tg_ms_company_detail_AFTER_INSERT';
const primaryKey = 'company_detail_id';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
      AFTER INSERT ON ms_company_detail
      FOR EACH ROW
      BEGIN
        DECLARE v_screen_id VARCHAR(50);
        DECLARE v_new_response LONGTEXT;

        -- Get Screen ID
        SET v_screen_id = SUBSTRING_INDEX(NEW.${primaryKey}, '-', 1);

        -- Generate New Response (Safely formatted JSON string)
        SET v_new_response = CONCAT(
          '{', CHAR(10),
          '  "company_id": "', IFNULL(NEW.company_id, ''), '",', CHAR(10),
          '  "brand_id": "', IFNULL(NEW.brand_id, ''), '",', CHAR(10),
          '  "branch_id": "', IFNULL(NEW.branch_id, ''), '",', CHAR(10),
          '  "department_id": "', IFNULL(NEW.department_id, ''), '",', CHAR(10),
          '  "division_id": "', IFNULL(NEW.division_id, ''), '",', CHAR(10),
          '  "created_date": "', IFNULL(NEW.created_date, ''), '",', CHAR(10),
          '  "created_by": "', IFNULL(NEW.created_by, ''), '",', CHAR(10),
          '  "unique_id": "', IFNULL(NEW.unique_id, ''), '",', CHAR(10),
          '  "is_active": "', IFNULL(NEW.is_active, ''), '"', CHAR(10),
          '}'
        );

        -- Insert Into Audit Trail Log
        INSERT INTO ad_trail_log_master_data (
          user_id,
          module,
          old_response,
          new_response,
          execution_type,
          executed_at
        )
        VALUES (
          NEW.created_by,
          v_screen_id,
          NULL,
          v_new_response,
          'INSERT',
          NEW.created_date
        );
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

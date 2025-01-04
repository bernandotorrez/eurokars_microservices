'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'tg_ms_company_detail_AFTER_UPDATE';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER tg_ms_company_detail_AFTER_UPDATE
        AFTER UPDATE ON ms_company_detail
        FOR EACH ROW
        BEGIN
            IF NEW.is_active = '0' THEN
                INSERT INTO ad_trail_log_master_data (user_id, module, execution_type, executed_at)
                VALUES (NEW.updated_by, 'Company Detail', 'DELETE', NEW.updated_date);
            ELSE
                INSERT INTO ad_trail_log_master_data (user_id, module, execution_type, executed_at)
                VALUES (NEW.updated_by, 'Company Detail', 'UPDATE', NEW.updated_date);
            END IF;
      END
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

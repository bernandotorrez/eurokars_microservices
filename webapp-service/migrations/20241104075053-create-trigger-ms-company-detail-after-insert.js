'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'tg_ms_company_detail_AFTER_INSERT';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
        AFTER INSERT ON ms_company_detail
        FOR EACH ROW
        BEGIN
            INSERT INTO ad_trail_log_master_data (user_id, module, execution_type, executed_at)
            VALUES (NEW.created_by, 'Company Detail', 'INSERT', NEW.created_date);
      END
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

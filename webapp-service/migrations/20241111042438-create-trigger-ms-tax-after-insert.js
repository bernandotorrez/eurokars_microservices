'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'tg';
const tableName = 'ms_tax';
const event = 'AFTER_INSERT'
const triggerName = `${prefix}_${tableName}_${event}`;
const moduleName = 'Tax';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
        AFTER INSERT ON ${tableName}
        FOR EACH ROW
        BEGIN
            INSERT INTO ad_trail_log_master_data (user_id, module, execution_type, executed_at)
            VALUES (NEW.created_by, '${moduleName}', 'INSERT', NEW.created_date);
      END
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

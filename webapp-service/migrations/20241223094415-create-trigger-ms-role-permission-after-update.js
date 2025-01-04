'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'tg';
const tableName = 'ms_role_permission';
const event = 'AFTER_UPDATE'
const triggerName = `${prefix}_${tableName}_${event}`;
const moduleName = 'Role Permission';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
        AFTER UPDATE ON ${tableName}
        FOR EACH ROW
        BEGIN
            IF NEW.is_active = '0' THEN
                INSERT INTO ad_trail_log_master_data (user_id, module, execution_type, executed_at)
                VALUES (NEW.updated_by, '${moduleName}', 'DELETE', NEW.updated_date);
            ELSE
                INSERT INTO ad_trail_log_master_data (user_id, module, execution_type, executed_at)
                VALUES (NEW.updated_by, '${moduleName}', 'UPDATE', NEW.updated_date);
            END IF;
      END
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

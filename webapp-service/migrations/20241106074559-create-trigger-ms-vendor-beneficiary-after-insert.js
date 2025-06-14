'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'tg';
const tableName = 'ms_vendor_beneficiary';
const event = 'AFTER_INSERT'
const triggerName = `${prefix}_${tableName}_${event}`;
const primaryKey = 'vendor_beneficiary_id';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
        AFTER INSERT ON ${tableName}
        FOR EACH ROW
        BEGIN
        DECLARE v_screen_id VARCHAR(50);
        DECLARE v_new_response LONGTEXT;

        -- Get Screen ID (Ensure it doesn't break if '-' is missing)
        SET v_screen_id = IFNULL(SUBSTRING_INDEX(NEW.${primaryKey}, '-', 1), '');

        -- Generate New Response (Safely formatted JSON string)
        SET v_new_response = CONCAT(
          '{', CHAR(10),
          '  "vendor_id": "', IFNULL(NEW.vendor_id, ''), '",', CHAR(10),
          '  "bank_id": "', IFNULL(NEW.bank_id, ''), '",', CHAR(10),
          '  "beneficiary_name": "', IFNULL(NEW.beneficiary_name, ''), '",', CHAR(10),
          '  "account_number": "', IFNULL(NEW.account_number, ''), '",', CHAR(10),
          '  "created_date": "', IFNULL(NEW.created_date, ''), '",', CHAR(10),
          '  "created_by": "', IFNULL(NEW.created_by, ''), '",', CHAR(10),
          '  "unique_id": "', IFNULL(NEW.unique_id, ''), '",', CHAR(10),
          '  "is_active": "', IFNULL(NEW.is_active, 0), '"', CHAR(10),
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
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

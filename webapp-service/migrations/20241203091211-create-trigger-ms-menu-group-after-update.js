'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'tg';
const tableName = 'ms_menu_group';
const event = 'AFTER_UPDATE'
const triggerName = `${prefix}_${tableName}_${event}`;
const primaryKey = 'menu_group_id';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
        AFTER UPDATE ON ${tableName}
        FOR EACH ROW
        BEGIN
        DECLARE v_screen_id VARCHAR(50);
        DECLARE v_old_response LONGTEXT;
        DECLARE v_new_response LONGTEXT;

        -- Get Screen ID Safely
        SET v_screen_id = IFNULL(SUBSTRING_INDEX(OLD.${primaryKey}, '-', 1), '');

        -- Generate Old Response using CONCAT
        SET v_old_response = CONCAT(
          '{', CHAR(10),
          '  "menu_group_code": "', IFNULL(OLD.menu_group_code, ''), '",', CHAR(10),
          '  "menu_group_name": "', IFNULL(OLD.menu_group_name, ''), '",', CHAR(10),
          '  "menu_group_description": "', IFNULL(OLD.menu_group_description, ''), '",', CHAR(10),
          '  "created_date": "', IFNULL(OLD.created_date, ''), '",', CHAR(10),
          '  "created_by": "', IFNULL(OLD.created_by, ''), '",', CHAR(10),
          '  "updated_date": "', IFNULL(OLD.updated_date, ''), '",', CHAR(10),
          '  "updated_by": "', IFNULL(OLD.updated_by, ''), '",', CHAR(10),
          '  "unique_id": "', IFNULL(OLD.unique_id, ''), '",', CHAR(10),
          '  "is_active": "', IFNULL(OLD.is_active, 0), '"', CHAR(10),
          '}'
        );

        -- Generate New Response using CONCAT
        SET v_new_response = CONCAT(
          '{', CHAR(10),
          '  "menu_group_code": "', IFNULL(NEW.menu_group_code, ''), '",', CHAR(10),
          '  "menu_group_name": "', IFNULL(NEW.menu_group_name, ''), '",', CHAR(10),
          '  "menu_group_description": "', IFNULL(NEW.menu_group_description, ''), '",', CHAR(10),
          '  "created_date": "', IFNULL(NEW.created_date, ''), '",', CHAR(10),
          '  "created_by": "', IFNULL(NEW.created_by, ''), '",', CHAR(10),
          '  "updated_date": "', IFNULL(NEW.updated_date, ''), '",', CHAR(10),
          '  "updated_by": "', IFNULL(NEW.updated_by, ''), '",', CHAR(10),
          '  "unique_id": "', IFNULL(NEW.unique_id, ''), '",', CHAR(10),
          '  "is_active": "', IFNULL(NEW.is_active, 0), '"', CHAR(10),
          '}'
        );

        -- Determine Execution Type
        IF NEW.is_active = '0' THEN
          INSERT INTO ad_trail_log_master_data (
            user_id, module, old_response, new_response, execution_type, executed_at
          ) VALUES (
            NEW.updated_by, v_screen_id, v_old_response, v_new_response, 'DELETE', NEW.updated_date
          );
        ELSE
          INSERT INTO ad_trail_log_master_data (
            user_id, module, old_response, new_response, execution_type, executed_at
          ) VALUES (
            NEW.updated_by, v_screen_id, v_old_response, v_new_response, 'UPDATE', NEW.updated_date
          );
        END IF;
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

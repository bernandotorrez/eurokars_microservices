'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'tg';
const tableName = 'ms_role_permission';
const event = 'AFTER_UPDATE'
const triggerName = `${prefix}_${tableName}_${event}`;
const primaryKey = 'role_permission_id';
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
          '  "menu_group_id": "', IFNULL(OLD.menu_group_id, ''), '",', CHAR(10),
          '  "header_navigation_id": "', IFNULL(OLD.header_navigation_id, ''), '",', CHAR(10),
          '  "role_id": "', IFNULL(OLD.role_id, ''), '",', CHAR(10),
          '  "can_view": "', IFNULL(OLD.can_view, ''), '",', CHAR(10),
          '  "can_add": "', IFNULL(OLD.can_add, ''), '",', CHAR(10),
          '  "can_edit": "', IFNULL(OLD.can_edit, ''), '",', CHAR(10),
          '  "can_delete": "', IFNULL(OLD.can_delete, ''), '",', CHAR(10),
          '  "can_send": "', IFNULL(OLD.can_send, ''), '",', CHAR(10),
          '  "can_approve": "', IFNULL(OLD.can_approve, ''), '",', CHAR(10),
          '  "can_reject": "', IFNULL(OLD.can_reject, ''), '",', CHAR(10),
          '  "can_report": "', IFNULL(OLD.can_report, ''), '",', CHAR(10),
          '  "can_cancel": "', IFNULL(OLD.can_cancel, ''), '",', CHAR(10),
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
          '  "menu_group_id": "', IFNULL(NEW.menu_group_id, ''), '",', CHAR(10),
          '  "header_navigation_id": "', IFNULL(NEW.header_navigation_id, ''), '",', CHAR(10),
          '  "role_id": "', IFNULL(NEW.role_id, ''), '",', CHAR(10),
          '  "can_view": "', IFNULL(NEW.can_view, ''), '",', CHAR(10),
          '  "can_add": "', IFNULL(NEW.can_add, ''), '",', CHAR(10),
          '  "can_edit": "', IFNULL(NEW.can_edit, ''), '",', CHAR(10),
          '  "can_delete": "', IFNULL(NEW.can_delete, ''), '",', CHAR(10),
          '  "can_send": "', IFNULL(NEW.can_send, ''), '",', CHAR(10),
          '  "can_approve": "', IFNULL(NEW.can_approve, ''), '",', CHAR(10),
          '  "can_reject": "', IFNULL(NEW.can_reject, ''), '",', CHAR(10),
          '  "can_report": "', IFNULL(NEW.can_report, ''), '",', CHAR(10),
          '  "can_cancel": "', IFNULL(NEW.can_cancel, ''), '",', CHAR(10),
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

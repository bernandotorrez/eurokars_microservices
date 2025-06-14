'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_vendor';
const event = 'add'
const spName = `${prefix}_${event}_${tableName}`;
const primaryKey = 'vendor_id';
const model = 'Vendor';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        CREATE PROCEDURE ${spName}(
            IN p_user_id VARCHAR(50),
            IN p_vendor_name VARCHAR(100),
            IN p_address TEXT,
            IN p_phone VARCHAR(20),
            IN p_telephone VARCHAR(20),
            IN p_fax VARCHAR(25),
            IN p_contact_person VARCHAR(100),
            IN p_email VARCHAR(100),
            IN p_postal_code VARCHAR(25),
            IN p_tax_id VARCHAR(25),
            IN p_identity_number VARCHAR(25),
            IN p_is_national ENUM('0', '1'),
            IN p_is_company ENUM('0', '1'),
            IN p_screen_id VARCHAR(50),
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-06] (Bernand Dayamuntari Hermawan) : Create Store Procedure Add ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check for duplicates data by checking vendor_name, if found then return 409
            * 3. Generate ID using an existing function
            * 4. Insert data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_generated_id VARCHAR(50); -- menampung variable untuk generate id
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user

            -- Check if user exists
            SELECT COUNT(user_id) INTO v_exists_user
            FROM ms_user
            WHERE user_id = p_user_id
            AND is_active = '1';

            -- if user not found then return 404
            IF v_exists_user = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = 'User not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE vendor_name = p_vendor_name
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = CONCAT(p_vendor_name,' already created');

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Generate ID using an existing function
            SELECT fn_gen_number(p_screen_id) INTO v_generated_id;

            -- Insert new data
            INSERT INTO ${tableName} (
                ${primaryKey}, vendor_name, address, phone,
                telephone, contact_person, email, fax,
                postal_code, tax_id, identity_number,
                is_national, is_company,
                created_by, created_date, unique_id
            ) VALUES (
                v_generated_id, p_vendor_name, p_address, p_phone,
                p_telephone, p_contact_person, p_email, p_fax,
                p_postal_code, p_tax_id, p_identity_number,
                p_is_national, p_is_company,
                p_user_id, NOW(), p_unique_id
            );

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            vendor_id, vendor_name, address, phone,
            telephone, contact_person, email, fax,
            postal_code, tax_id, identity_number,
            is_national, is_company,
            created_by,
            created_date,
            unique_id
            FROM ${tableName} WHERE ${primaryKey} = v_generated_id
            AND is_active = '1'
            LIMIT 1;

        END proc_label;

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

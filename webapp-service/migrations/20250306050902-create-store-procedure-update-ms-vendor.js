'use strict';

/** @type {import('sequelize-cli').Migration} */
const prefix = 'sp';
const tableName = 'ms_vendor';
const event = 'update'
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
            IN p_unique_id VARCHAR(50)
        )
        proc_label: BEGIN

            /* Changelog :
            * v1 : [2025-03-06] (Bernand Dayamuntari Hermawan) : Create Store Procedure Update ${tableName}
            */

            /* Flow :
            * 1. Check if user exists, if not found then return 404
            * 2. Check if ${model} is exists, if not found then return 404
            * 3. Check for duplicates data by checking vendor_name, if found then return 409
            * 4. Update data
            */

            DECLARE v_duplicate_count INT; -- menampung variable untuk check duplicate data
            DECLARE v_return_code INT DEFAULT 200; -- menampung variable untuk return code
            DECLARE v_return_message VARCHAR(255) DEFAULT 'Success'; -- menampung variable untuk return message
            DECLARE v_exists_user INT; -- menampung variable untuk check user
            DECLARE v_exists INT; -- menampung variable untuk check data ${model}

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

            -- Check if ${model} is exists
            SELECT COUNT(${primaryKey}) INTO v_exists
            FROM ${tableName}
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- if ${model} not found then return 404
            IF v_exists = 0 THEN
                SET v_return_code = 404;
                SET v_return_message = '${model} not found';

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Check for duplicates
            SELECT COUNT(${primaryKey}) INTO v_duplicate_count
            FROM ${tableName}
            WHERE vendor_name = p_vendor_name
            AND unique_id <> p_unique_id
            AND is_active = '1';

            IF v_duplicate_count >= 1 THEN
                SET v_return_code = 409;
                SET v_return_message = CONCAT(p_vendor_name,' already created');

                -- Return error code and message
                SELECT v_return_code AS return_code, v_return_message AS return_message, NULL AS data;
                LEAVE proc_label;
            END IF;

            -- Update data
            UPDATE ${tableName}
            SET vendor_name = p_vendor_name,
            address = p_address,
            phone = p_phone,
            telephone = p_telephone,
            fax = p_fax,
            contact_person = p_contact_person,
            email = p_email,
            postal_code = p_postal_code,
            tax_id = p_tax_id,
            identity_number = p_identity_number,
            is_national = p_is_national,
            is_company = p_is_company,
            updated_by = p_user_id,
            updated_date = NOW()
            WHERE unique_id = p_unique_id
            AND is_active = '1';

            -- Return success code, message, and data
            SELECT v_return_code AS return_code, v_return_message AS return_message,
            vendor_id, vendor_name, address, phone,
            telephone, contact_person, email, fax,
            postal_code, tax_id, identity_number,
            is_national, is_company,
            updated_by,
            updated_date,
            unique_id
            FROM ${tableName} WHERE unique_id = p_unique_id
            AND is_active = '1'
            LIMIT 1;

        END proc_label;

    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS ${spName}`);
  }
};

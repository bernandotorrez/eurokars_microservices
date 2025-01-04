'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'fn_gen_number';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_gen_number(p_screen_id VARCHAR(10))
      RETURNS VARCHAR(100)
      DETERMINISTIC
      BEGIN
          DECLARE seq_value INT;
          DECLARE V_SCREEN_ID VARCHAR(10);
          DECLARE V_PTN_PREFIX VARCHAR(10);
          DECLARE V_SEQ_FLG int;
          DECLARE V_DIGIT int;
          DECLARE V_DATE int;
          DECLARE V_CNT_DATE_FMT VARCHAR(8);
          DECLARE V_MAX_DIGIT int;
          DECLARE V_C_CNT_PTN VARCHAR(2);
          DECLARE result VARCHAR(100);
      
          -- Ambil nilai dari tabel ms_screenid berdasarkan screen_id
          SELECT SCREEN_ID,PTN_PREFIX, SEQ_FLG,CNT_DATE_FMT, digit,max_digit,c_cnt_ptn
          INTO V_SCREEN_ID,V_PTN_PREFIX, V_SEQ_FLG,V_CNT_DATE_FMT,V_DIGIT,V_MAX_DIGIT,V_C_CNT_PTN
          FROM ms_counter_number
          WHERE SCREEN_ID = p_screen_id
          LIMIT 1;  -- Hanya ambil satu baris
      
          -- Panggil fungsi get_sequence untuk mendapatkan nilai sequence
          SET seq_value = fn_get_sequence(p_screen_id);
      
        SET V_DATE = DATE_FORMAT(CURDATE(), V_CNT_DATE_FMT);
          
          -- Format nomor dengan hasil sequence dan nilai dari ms_screenid
          -- SET result = CONCAT(V_PTN_PREFIX, V_C_CNT_PTN, V_C_CNT_PTN, V_DATE, V_C_CNT_PTN,LPAD(V_SEQ_FLG, V_DIGIT, '0'));
      
          -- Format nomor dengan hasil sequence dan nilai dari ms_screenid
        IF V_PTN_PREFIX = 'MS' THEN
              SET result = CONCAT(V_SCREEN_ID, V_C_CNT_PTN, LPAD(V_SEQ_FLG, V_DIGIT, '0'));
          ELSE
            SET result = CONCAT(V_PTN_PREFIX, V_C_CNT_PTN, V_C_CNT_PTN, V_DATE, V_C_CNT_PTN,LPAD(V_SEQ_FLG, V_DIGIT, '0'));
        END IF;
          
          -- Kembalikan hasil format nomor
          SET result = LEFT (result,V_MAX_DIGIT);
          RETURN result;
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP FUNCTION ${triggerName}`);
  }
};

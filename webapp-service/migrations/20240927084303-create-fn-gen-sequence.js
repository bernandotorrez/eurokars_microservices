'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'fn_get_sequence';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE FUNCTION ${triggerName}(p_screen_id VARCHAR(10))
      RETURNS INT(11)
      DETERMINISTIC
      BEGIN
          DECLARE p_seq_value INT;

          SELECT COALESCE(MAX(seq_value), 0) + 1 INTO p_seq_value
          FROM sq_sequence
          WHERE screen_id = p_screen_id;

          UPDATE sq_sequence
          SET seq_value = p_seq_value
          WHERE screen_id = p_screen_id;

          RETURN p_seq_value;
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP FUNCTION ${triggerName}`);
  }
};

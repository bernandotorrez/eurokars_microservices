'use strict';

/** @type {import('sequelize-cli').Migration} */
const triggerName = 'tg_sequence_AFTER_UPDATE';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TRIGGER ${triggerName}
      AFTER UPDATE ON sq_sequence
      FOR EACH ROW
      BEGIN
          UPDATE ms_counter_number
          SET seq_flg = NEW.seq_value
          WHERE screen_id = NEW.screen_id;
      END
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER ${triggerName}`);
  }
};

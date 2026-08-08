'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Untitled Post'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Posts', 'title');
  }
};

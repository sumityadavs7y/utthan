'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Charity'
    });

    await queryInterface.addIndex('Posts', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Posts', ['category']);
    await queryInterface.removeColumn('Posts', 'category');
  }
};

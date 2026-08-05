'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TeamMembers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imagePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('TeamMembers', ['category']);
    await queryInterface.addIndex('TeamMembers', ['sortOrder']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('TeamMembers');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chairmen', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      photoPath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      signaturePath: {
        type: Sequelize.STRING,
        allowNull: true
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Chairmen');
  }
};

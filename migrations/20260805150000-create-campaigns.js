'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Campaigns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      imagePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      goalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      raisedAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      authorName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      authorImagePath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
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

    await queryInterface.addIndex('Campaigns', ['category']);
    await queryInterface.addIndex('Campaigns', ['sortOrder']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Campaigns');
  }
};

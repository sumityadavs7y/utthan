'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SiteConfigs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      addressShort: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mapEmbedUrl: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      facebookUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instagramUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      twitterUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      linkedinUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      youtubeUrl: {
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
    await queryInterface.dropTable('SiteConfigs');
  }
};

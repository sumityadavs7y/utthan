'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Untitled Post' },
      category: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Charity' },
      imagePath: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Galleries', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: true },
      caption: { type: Sequelize.STRING, allowNull: true },
      imagePath: { type: Sequelize.STRING, allowNull: false },
      mediaDate: { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Campaigns', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      category: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'ongoing' },
      summary: { type: Sequelize.TEXT, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      imagePath: { type: Sequelize.STRING, allowNull: false },
      photoPaths: { type: Sequelize.TEXT, allowNull: true },
      timeline: { type: Sequelize.TEXT, allowNull: true },
      goalAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      raisedAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      authorName: { type: Sequelize.STRING, allowNull: true },
      authorImagePath: { type: Sequelize.STRING, allowNull: true },
      location: { type: Sequelize.STRING, allowNull: true },
      startDate: { type: Sequelize.DATEONLY, allowNull: true },
      endDate: { type: Sequelize.DATEONLY, allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('TeamMembers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      designation: { type: Sequelize.STRING, allowNull: true },
      imagePath: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      bio: { type: Sequelize.TEXT, allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Chairmen', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      photoPath: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: true },
      signaturePath: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('SiteConfigs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      phone: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.STRING, allowNull: false },
      addressShort: { type: Sequelize.STRING, allowNull: true },
      mapEmbedUrl: { type: Sequelize.TEXT, allowNull: true },
      facebookUrl: { type: Sequelize.STRING, allowNull: true },
      instagramUrl: { type: Sequelize.STRING, allowNull: true },
      twitterUrl: { type: Sequelize.STRING, allowNull: true },
      linkedinUrl: { type: Sequelize.STRING, allowNull: true },
      youtubeUrl: { type: Sequelize.STRING, allowNull: true },
      upiId: { type: Sequelize.STRING, allowNull: true },
      bankName: { type: Sequelize.STRING, allowNull: true },
      accountName: { type: Sequelize.STRING, allowNull: true },
      accountNumber: { type: Sequelize.STRING, allowNull: true },
      ifsc: { type: Sequelize.STRING, allowNull: true },
      qrImagePath: { type: Sequelize.STRING, allowNull: true },
      donationLink: { type: Sequelize.STRING, allowNull: true },
      memberFeeNote: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('ContactMessages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      source: { type: Sequelize.STRING, allowNull: false, defaultValue: 'contact' },
      isRead: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('VolunteerApplications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      company: { type: Sequelize.STRING, allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      isRead: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('ImpactStats', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      prefix: { type: Sequelize.STRING, allowNull: true },
      suffix: { type: Sequelize.STRING, allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Testimonials', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      quote: { type: Sequelize.TEXT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: true },
      imagePath: { type: Sequelize.STRING, allowNull: false },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Testimonials');
    await queryInterface.dropTable('ImpactStats');
    await queryInterface.dropTable('VolunteerApplications');
    await queryInterface.dropTable('ContactMessages');
    await queryInterface.dropTable('SiteConfigs');
    await queryInterface.dropTable('Chairmen');
    await queryInterface.dropTable('TeamMembers');
    await queryInterface.dropTable('Campaigns');
    await queryInterface.dropTable('Galleries');
    await queryInterface.dropTable('Posts');
  }
};

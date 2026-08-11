'use strict';

/** Drop unused admin/CMS tables and rebuild Posts/Galleries without userId. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    await queryInterface.dropTable('Certificates').catch(() => {});
    await queryInterface.dropTable('Media').catch(() => {});
    await queryInterface.dropTable('NewsletterSubscribers').catch(() => {});

    if (dialect === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF');

      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS Posts_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          title VARCHAR(255) NOT NULL DEFAULT 'Untitled Post',
          category VARCHAR(255) NOT NULL DEFAULT 'Charity',
          imagePath VARCHAR(255),
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      await queryInterface.sequelize.query(`
        INSERT INTO Posts_new (id, content, title, category, imagePath, createdAt, updatedAt)
        SELECT id, content, title, category, imagePath, createdAt, updatedAt FROM Posts
      `).catch(() => {});
      await queryInterface.dropTable('Posts').catch(() => {});
      await queryInterface.sequelize.query('ALTER TABLE Posts_new RENAME TO Posts');

      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS Galleries_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255),
          caption VARCHAR(255),
          imagePath VARCHAR(255) NOT NULL,
          mediaDate DATE,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      await queryInterface.sequelize.query(`
        INSERT INTO Galleries_new (id, title, caption, imagePath, mediaDate, createdAt, updatedAt)
        SELECT id, title, caption, imagePath, mediaDate, createdAt, updatedAt FROM Galleries
      `).catch(() => {});
      await queryInterface.dropTable('Galleries').catch(() => {});
      await queryInterface.sequelize.query('ALTER TABLE Galleries_new RENAME TO Galleries');

      await queryInterface.dropTable('Users').catch(() => {});
      await queryInterface.sequelize.query('PRAGMA foreign_keys = ON');
      return;
    }

    // Postgres / others
    await queryInterface.removeColumn('Posts', 'userId').catch(() => {});
    await queryInterface.removeColumn('Galleries', 'userId').catch(() => {});
    await queryInterface.dropTable('Users').catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    // Irreversible cleanup for unused models
  }
};

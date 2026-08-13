'use strict';

/**
 * Add Posts.photoPaths (JSON array of MediaAsset ids) and copy the existing cover imageId in.
 */

function parseExtra(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Posts');
    if (!table.photoPaths) {
      await queryInterface.addColumn('Posts', 'photoPaths', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    const rows = await queryInterface.sequelize.query(
      'SELECT id, imageId, photoPaths FROM Posts',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const row of rows) {
      const existing = parseExtra(row.photoPaths)
        .map(Number)
        .filter(Boolean);
      if (existing.length) continue;
      const imageId = Number(row.imageId);
      if (!imageId) continue;

      await queryInterface.sequelize.query(
        'UPDATE Posts SET photoPaths = :photoPaths, updatedAt = :updatedAt WHERE id = :id',
        {
          replacements: {
            id: row.id,
            photoPaths: JSON.stringify([imageId]),
            updatedAt: new Date()
          }
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Posts');
    if (table.photoPaths) {
      await queryInterface.removeColumn('Posts', 'photoPaths');
    }
  }
};

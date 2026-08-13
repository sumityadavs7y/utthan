'use strict';

/**
 * Fold extra.body2 into PageBlocks.body as a second paragraph (separated by a blank line).
 * Safe to re-run: skips rows with no body2, and does not duplicate if body already contains body2.
 */

function parseExtra(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return { ...raw };
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...parsed } : {};
  } catch {
    return {};
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rows = await queryInterface.sequelize.query(
      'SELECT id, body, extra FROM PageBlocks',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const row of rows) {
      const extra = parseExtra(row.extra);
      const body2 = String(extra.body2 || '').trim();
      if (!body2) continue;

      const body = String(row.body || '').trim();
      const alreadyMerged = body === body2 || body.endsWith(body2);
      const nextBody = alreadyMerged ? body : (body ? `${body}\n\n${body2}` : body2);
      delete extra.body2;

      await queryInterface.sequelize.query(
        'UPDATE PageBlocks SET body = :body, extra = :extra, updatedAt = :updatedAt WHERE id = :id',
        {
          replacements: {
            id: row.id,
            body: nextBody,
            extra: JSON.stringify(extra),
            updatedAt: new Date()
          }
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const rows = await queryInterface.sequelize.query(
      'SELECT id, body, extra FROM PageBlocks',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const row of rows) {
      const body = String(row.body || '');
      const parts = body.split(/\n\n+/);
      if (parts.length < 2) continue;

      const extra = parseExtra(row.extra);
      extra.body2 = parts.slice(1).join('\n\n').trim();
      const nextBody = parts[0].trim();

      await queryInterface.sequelize.query(
        'UPDATE PageBlocks SET body = :body, extra = :extra, updatedAt = :updatedAt WHERE id = :id',
        {
          replacements: {
            id: row.id,
            body: nextBody,
            extra: JSON.stringify(extra),
            updatedAt: new Date()
          }
        }
      );
    }
  }
};

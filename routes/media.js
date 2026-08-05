const express = require('express');
const { Media } = require('../models');

const router = express.Router();

router.get('/media/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).send('Invalid media id');
    }

    const media = await Media.findByPk(id, {
      attributes: ['id', 'mimeType', 'originalName', 'data', 'updatedAt']
    });

    if (!media || !media.data) {
      return res.status(404).send('Not found');
    }

    const buffer = Buffer.isBuffer(media.data) ? media.data : Buffer.from(media.data);

    res.set({
      'Content-Type': media.mimeType || 'application/octet-stream',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"media-${media.id}-${new Date(media.updatedAt).getTime()}"`
    });

    if (media.originalName) {
      res.set('Content-Disposition', `inline; filename="${media.originalName.replace(/"/g, '')}"`);
    }

    return res.send(buffer);
  } catch (error) {
    console.error('Media serve error:', error);
    return res.status(500).send('Unable to load media');
  }
});

module.exports = router;

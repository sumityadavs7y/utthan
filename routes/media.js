const { MediaAsset } = require('../models');

function createMediaRouter(express) {
  const router = express.Router();

  router.get('/media/:id', async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(404).end();
      const asset = await MediaAsset.findByPk(id);
      if (!asset) return res.status(404).end();

      const body = Buffer.isBuffer(asset.data) ? asset.data : Buffer.from(asset.data);
      res.setHeader('Content-Type', asset.mimeType || 'application/octet-stream');
      res.setHeader('Content-Length', String(body.length));
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(body);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = { createMediaRouter };

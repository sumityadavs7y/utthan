const { Op } = require('sequelize');
const { upload } = require('../middleware/upload');
const { requireAuth, verifyCsrf, wantsJson } = require('../middleware/auth');
const { userCan } = require('../utils/permissions');
const { createMediaFromUpload } = require('../utils/media');
const { parseExtra } = require('../utils/pageBlocks');
const { parsePhotoList, slugify } = require('../utils/helpers');
const {
  EXTRA_FIELDS,
  getSpec,
  fieldsFor,
  permissionFor,
  serializeRecord,
  applySlug
} = require('../utils/cmsCatalog');
const { Campaign, Partner, PageBlock } = require('../models');

function isHomeFeature(record) {
  const key = record && record.blockKey;
  return Boolean(key && key.startsWith('what-we-do-') && key !== 'what-we-do-heading');
}

function fileByField(files, name) {
  return (files || []).find((file) => file.fieldname === name) || null;
}

function filesByField(files, name) {
  return (files || []).filter((file) => file.fieldname === name);
}

function boolFrom(value) {
  return value === '1' || value === 'true' || value === 'on' || value === true;
}

function asList(value) {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

async function collectTimelineItems(body, files) {
  if (body.timelineCount == null || body.timelineCount === '') return null;
  const count = Number(body.timelineCount);
  if (!Number.isFinite(count) || count < 0) return [];
  const items = [];
  for (let i = 0; i < count; i += 1) {
    if (body[`timeline_${i}_remove`] === '1') continue;
    const date = String(body[`timeline_${i}_date`] || '').trim();
    const title = String(body[`timeline_${i}_title`] || '').trim();
    const detail = String(body[`timeline_${i}_detail`] || '').trim();
    const photoIds = asList(body[`timeline_${i}_photoKeep`]).map(Number).filter(Boolean);
    const uploaded = filesByField(files, `timeline_${i}_photos`);
    for (const file of uploaded) {
      const asset = await createMediaFromUpload(file);
      if (asset) photoIds.push(asset.id);
    }
    if (!date && !title && !detail && !photoIds.length) continue;
    items.push({ date, title, detail, photoIds });
  }
  return items;
}

function permissionDenied(req, res) {
  if (wantsJson(req)) {
    return res.status(403).json({ ok: false, error: 'You do not have permission to do that.' });
  }
  req.flash('error', 'You do not have permission to do that.');
  return res.redirect('back');
}

async function uniqueCampaignSlug(base, ignoreId = null) {
  let slug = slugify(base) || `campaign-${Date.now()}`;
  let n = 1;
  while (true) {
    const where = { slug };
    if (ignoreId) where.id = { [Op.ne]: ignoreId };
    const found = await Campaign.findOne({ where });
    if (!found) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

async function buildPayload(type, spec, body, files, existing) {
  const payload = {};
  const extra = existing ? parseExtra(existing.extra) : {};
  const fields = fieldsFor(type, existing) || spec.fields;

  for (const field of fields) {
    if (field.type === 'file' || field.type === 'files' || field.type === 'timeline') continue;
    if (EXTRA_FIELDS.some((item) => item.name === field.name)) {
      extra[field.name] = String(body[field.name] || '').trim();
      continue;
    }
    if (field.type === 'checkbox') {
      payload[field.name] = boolFrom(body[field.name]);
      continue;
    }
    if (field.type === 'number') {
      const raw = body[field.name];
      payload[field.name] = raw === '' || raw == null ? (field.name === 'sortOrder' ? 0 : 0) : Number(raw);
      continue;
    }
    if (body[field.name] !== undefined) {
      const value = String(body[field.name] ?? '').trim();
      payload[field.name] = value === '' ? null : value;
    }
  }

  if (type === 'page-block' || type === 'home-feature') {
    delete extra.body2;
    payload.extra = JSON.stringify(extra);
  }

  if (type === 'campaign') {
    applySlug(payload);
    if (payload.slug) {
      payload.slug = await uniqueCampaignSlug(payload.slug, existing && existing.id);
    }
    const timelineItems = await collectTimelineItems(body, files);
    if (timelineItems) payload.timeline = JSON.stringify(timelineItems);
  }

  if (type === 'post' && !payload.category) payload.category = 'Charity';

  for (const field of fields) {
    if (field.type === 'file') {
      const file = fileByField(files, field.name);
      if (file) {
        const asset = await createMediaFromUpload(file);
        if (asset) payload[field.mapsTo] = asset.id;
      }
    }
    if (field.type === 'files') {
      const managed = body.photosManaged === '1' || body.photosManaged === 'true';
      let ids = managed
        ? asList(body.photosKeep).map(Number).filter(Boolean)
        : (existing ? parsePhotoList(existing.photoPaths).map(Number).filter(Boolean) : []);
      const uploaded = filesByField(files, field.name);
      for (const file of uploaded) {
        const asset = await createMediaFromUpload(file);
        if (asset) ids.push(asset.id);
      }
      payload.photoPaths = JSON.stringify(ids);
      if (type === 'post') {
        payload.imageId = ids[0] || null;
        payload.imagePath = ids[0] ? `/media/${ids[0]}` : '';
      }
    }
  }

  if (body.category && type === 'team-member') payload.category = body.category;
  if (payload.imageId) payload.imagePath = `/media/${payload.imageId}`;
  else if (type === 'campaign' || type === 'post' || type === 'gallery' || type === 'team-member' || type === 'testimonial') {
    if (!existing) payload.imagePath = payload.imagePath || '';
  }
  if (payload.photoId) payload.photoPath = `/media/${payload.photoId}`;
  else if (type === 'chairman' && !existing) payload.photoPath = payload.photoPath || '';
  if (payload.qrImageId) payload.qrImagePath = `/media/${payload.qrImageId}`;
  return payload;
}

function createCmsRouter(express) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/list/:type', async (req, res, next) => {
    try {
      const spec = getSpec(req.params.type);
      if (!spec || !spec.listEditable) {
        return res.status(404).json({ ok: false, error: 'This content is not list-editable.' });
      }
      if (!userCan(req.currentUser, spec.permission)) return permissionDenied(req, res);

      const rows = await spec.model.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
      const heading = await PageBlock.findOne({
        where: { pageKey: 'home', blockKey: 'partners-heading' }
      });

      return res.json({
        ok: true,
        mode: 'list',
        type: req.params.type,
        label: 'Partners',
        fields: spec.fields,
        heading: heading
          ? { id: heading.id, title: heading.title || '', lede: heading.lede || '' }
          : { id: null, title: 'Our partners', lede: '' },
        items: rows.map((row) => serializeRecord(req.params.type, row))
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/list/:type', verifyCsrf, upload.any(), async (req, res, next) => {
    try {
      const spec = getSpec(req.params.type);
      if (!spec || !spec.listEditable) {
        return res.status(404).json({ ok: false, error: 'This content is not list-editable.' });
      }
      if (!userCan(req.currentUser, spec.permission)) return permissionDenied(req, res);

      const headingTitle = String(req.body.headingTitle || '').trim();
      const headingLede = String(req.body.headingLede || '').trim();
      const heading = await PageBlock.findOne({
        where: { pageKey: 'home', blockKey: 'partners-heading' }
      });
      if (heading) {
        await heading.update({
          title: headingTitle || heading.title,
          lede: headingLede || null
        });
      }

      const rowCount = Math.max(0, parseInt(req.body.rowCount, 10) || 0);

      for (let i = 0; i < rowCount; i += 1) {
        const removed = req.body[`row_${i}_remove`] === '1';
        const id = parseInt(req.body[`row_${i}_id`], 10) || null;
        const name = String(req.body[`row_${i}_name`] || '').trim();
        const showName = req.body[`row_${i}_showName`] === '1';
        const logoFile = fileByField(req.files || [], `row_${i}_logo`);

        if (removed) {
          if (id) await Partner.destroy({ where: { id } });
          continue;
        }
        if (!name && !id) continue;
        if (!name) {
          return res.status(400).json({ ok: false, error: 'Each partner needs a name.' });
        }

        const payload = { name, showName, sortOrder: i + 1 };
        if (logoFile) {
          const asset = await createMediaFromUpload(logoFile);
          if (asset) payload.logoId = asset.id;
        }

        if (id) {
          const existing = await Partner.findByPk(id);
          if (existing) await existing.update(payload);
        } else {
          await Partner.create(payload);
        }
      }

      if (wantsJson(req) || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({ ok: true });
      }
      req.flash('success', 'Partners saved.');
      return res.redirect('back');
    } catch (err) {
      if (wantsJson(req)) {
        return res.status(400).json({ ok: false, error: err.message || 'Could not save partners.' });
      }
      return next(err);
    }
  });

  router.get('/:type/:id', async (req, res, next) => {
    try {
      const spec = getSpec(req.params.type);
      if (!spec) return res.status(404).json({ ok: false, error: 'Unknown content type.' });
      const record = await spec.model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ ok: false, error: 'Not found.' });
      if (req.params.type === 'home-feature' && !isHomeFeature(record)) {
        return res.status(404).json({ ok: false, error: 'Not found.' });
      }
      const permission = permissionFor(spec, record);
      if (!userCan(req.currentUser, permission)) return permissionDenied(req, res);
      return res.json({
        ok: true,
        type: req.params.type,
        id: record.id,
        label: spec.label,
        fields: fieldsFor(req.params.type, record),
        values: serializeRecord(req.params.type, record),
        deletable: Boolean(spec.deletable)
      });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/:type', async (req, res, next) => {
    try {
      const spec = getSpec(req.params.type);
      if (!spec) return res.status(404).json({ ok: false, error: 'Unknown content type.' });
      let extra = {};
      try {
        extra = req.query.extra ? JSON.parse(req.query.extra) : {};
      } catch {
        extra = {};
      }
      const permission = permissionFor(spec, extra, extra);
      if (!userCan(req.currentUser, permission)) return permissionDenied(req, res);
      return res.json({
        ok: true,
        type: req.params.type,
        id: null,
        label: spec.label,
        fields: spec.fields,
        values: extra,
        deletable: false
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/:type/:id/delete', verifyCsrf, async (req, res, next) => {
    try {
      const spec = getSpec(req.params.type);
      if (!spec || !spec.deletable) {
        return res.status(400).json({ ok: false, error: 'This item cannot be deleted.' });
      }
      const record = await spec.model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ ok: false, error: 'Not found.' });
      if (req.params.type === 'home-feature' && !isHomeFeature(record)) {
        return res.status(400).json({ ok: false, error: 'This item cannot be deleted.' });
      }
      const permission = permissionFor(spec, record);
      if (!userCan(req.currentUser, permission)) return permissionDenied(req, res);
      await record.destroy();
      if (wantsJson(req)) return res.json({ ok: true });
      req.flash('success', 'Deleted.');
      return res.redirect('back');
    } catch (err) {
      return next(err);
    }
  });

  router.post('/:type/:id?', verifyCsrf, upload.any(), async (req, res, next) => {
    try {
      const spec = getSpec(req.params.type);
      if (!spec) return res.status(404).json({ ok: false, error: 'Unknown content type.' });

      const existing = req.params.id ? await spec.model.findByPk(req.params.id) : null;
      if (req.params.id && !existing) {
        return res.status(404).json({ ok: false, error: 'Not found.' });
      }

      let extra = {};
      try {
        extra = req.body.extra ? JSON.parse(req.body.extra) : {};
      } catch {
        extra = {};
      }
      if (req.body.category) extra.category = req.body.category;

      const permission = permissionFor(spec, existing || extra, extra);
      if (!userCan(req.currentUser, permission)) return permissionDenied(req, res);

      const payload = await buildPayload(req.params.type, spec, req.body, req.files || [], existing);

      if (existing) {
        await existing.update(payload);
      } else {
        if (req.params.type === 'campaign' && !payload.imageId) {
          return res.status(400).json({ ok: false, error: 'A cover photo is required.' });
        }
        if (req.params.type === 'gallery' && !payload.imageId) {
          return res.status(400).json({ ok: false, error: 'A photo is required.' });
        }
        if (req.params.type === 'team-member' && extra.category && !payload.category) {
          payload.category = extra.category;
        }
        if (req.params.type === 'page-block') {
          return res.status(400).json({ ok: false, error: 'Page sections cannot be created from here.' });
        }
        if (req.params.type === 'site-config') {
          return res.status(400).json({ ok: false, error: 'Site settings already exist.' });
        }
        if (req.params.type === 'home-feature') {
          const maxSort = await PageBlock.max('sortOrder', {
            where: { pageKey: 'home', blockKey: { [Op.like]: 'what-we-do-%' } }
          });
          payload.pageKey = 'home';
          payload.blockKey = `what-we-do-${Date.now()}`;
          payload.sortOrder = (Number(maxSort) || 0) + 1;
        }
        await spec.model.create(payload);
      }

      if (wantsJson(req) || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({ ok: true });
      }
      req.flash('success', 'Saved.');
      return res.redirect('back');
    } catch (err) {
      if (wantsJson(req)) {
        return res.status(400).json({ ok: false, error: err.message || 'Could not save.' });
      }
      return next(err);
    }
  });

  return router;
}

module.exports = { createCmsRouter };

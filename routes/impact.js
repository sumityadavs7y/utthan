const express = require('express');
const { ImpactStat, Testimonial } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { saveUploadedFile, deleteMediaByUrl } = require('../utils/media');

const router = express.Router();

const renderPage = (res, view, locals) => {
  res.render(view, {
    skin: 'skin-1',
    loaderStyle: 'page-1',
    isHome: false,
    extraCss: [],
    extraJs: [],
    ...locals
  });
};

function parseIntSafe(value, fallback = 0) {
  const n = Number.parseInt(String(value ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function clean(value, max = 255) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.slice(0, max);
}

function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/admin/impact');
    }
    return next();
  });
}

async function loadImpactAdminData() {
  const [stats, testimonials] = await Promise.all([
    ImpactStat.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] }),
    Testimonial.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
  ]);
  return { stats, testimonials };
}

router.get('/admin/impact', requireAdmin, async (req, res) => {
  try {
    const data = await loadImpactAdminData();
    renderPage(res, 'admin-impact', {
      title: 'Impact & Testimonials - Utthan Foundation',
      currentPage: 'admin-impact',
      ...data
    });
  } catch (error) {
    console.error('Impact admin load error:', error);
    req.flash('error', 'Unable to load impact settings.');
    return res.redirect('/account');
  }
});

router.post('/admin/impact/stats', requireAdmin, async (req, res) => {
  try {
    const label = clean(req.body.label, 120);
    const value = parseIntSafe(req.body.value, 0);
    const prefix = clean(req.body.prefix, 20) || null;
    const suffix = clean(req.body.suffix, 20) || null;
    const sortOrder = parseIntSafe(req.body.sortOrder, 0);

    if (!label) {
      req.flash('error', 'Stat label is required.');
      return res.redirect('/admin/impact');
    }

    await ImpactStat.create({ label, value, prefix, suffix, sortOrder });
    req.flash('success', 'Impact stat added.');
    return res.redirect('/admin/impact#stats');
  } catch (error) {
    console.error('Impact stat create error:', error);
    req.flash('error', 'Unable to add impact stat.');
    return res.redirect('/admin/impact');
  }
});

router.post('/admin/impact/stats/:id/edit', requireAdmin, async (req, res) => {
  try {
    const stat = await ImpactStat.findByPk(Number(req.params.id));
    if (!stat) {
      req.flash('error', 'Stat not found.');
      return res.redirect('/admin/impact');
    }

    const label = clean(req.body.label, 120);
    if (!label) {
      req.flash('error', 'Stat label is required.');
      return res.redirect('/admin/impact');
    }

    stat.label = label;
    stat.value = parseIntSafe(req.body.value, 0);
    stat.prefix = clean(req.body.prefix, 20) || null;
    stat.suffix = clean(req.body.suffix, 20) || null;
    stat.sortOrder = parseIntSafe(req.body.sortOrder, 0);
    await stat.save();

    req.flash('success', 'Impact stat updated.');
    return res.redirect('/admin/impact#stats');
  } catch (error) {
    console.error('Impact stat edit error:', error);
    req.flash('error', 'Unable to update impact stat.');
    return res.redirect('/admin/impact');
  }
});

router.post('/admin/impact/stats/:id/delete', requireAdmin, async (req, res) => {
  try {
    const stat = await ImpactStat.findByPk(Number(req.params.id));
    if (!stat) {
      req.flash('error', 'Stat not found.');
      return res.redirect('/admin/impact');
    }
    await stat.destroy();
    req.flash('success', 'Impact stat deleted.');
    return res.redirect('/admin/impact#stats');
  } catch (error) {
    console.error('Impact stat delete error:', error);
    req.flash('error', 'Unable to delete impact stat.');
    return res.redirect('/admin/impact');
  }
});

router.post('/admin/impact/testimonials', requireAdmin, handleUpload, async (req, res) => {
  try {
    const title = clean(req.body.title, 200);
    const quote = clean(req.body.quote, 5000);
    const name = clean(req.body.name, 120);
    const role = clean(req.body.role, 120) || null;
    const sortOrder = parseIntSafe(req.body.sortOrder, 0);

    if (!title || !quote || !name) {
      req.flash('error', 'Title, quote, and name are required.');
      return res.redirect('/admin/impact');
    }
    if (!req.file) {
      req.flash('error', 'Photo is required.');
      return res.redirect('/admin/impact');
    }

    const imagePath = await saveUploadedFile(req.file);
    await Testimonial.create({ title, quote, name, role, imagePath, sortOrder });
    req.flash('success', 'Testimonial added.');
    return res.redirect('/admin/impact#testimonials');
  } catch (error) {
    console.error('Testimonial create error:', error);
    req.flash('error', 'Unable to add testimonial.');
    return res.redirect('/admin/impact');
  }
});

router.post('/admin/impact/testimonials/:id/edit', requireAdmin, handleUpload, async (req, res) => {
  try {
    const item = await Testimonial.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Testimonial not found.');
      return res.redirect('/admin/impact');
    }

    const title = clean(req.body.title, 200);
    const quote = clean(req.body.quote, 5000);
    const name = clean(req.body.name, 120);
    if (!title || !quote || !name) {
      req.flash('error', 'Title, quote, and name are required.');
      return res.redirect('/admin/impact');
    }

    item.title = title;
    item.quote = quote;
    item.name = name;
    item.role = clean(req.body.role, 120) || null;
    item.sortOrder = parseIntSafe(req.body.sortOrder, 0);

    if (req.file) {
      const previous = item.imagePath;
      item.imagePath = await saveUploadedFile(req.file);
      await deleteMediaByUrl(previous);
    }

    await item.save();
    req.flash('success', 'Testimonial updated.');
    return res.redirect('/admin/impact#testimonials');
  } catch (error) {
    console.error('Testimonial edit error:', error);
    req.flash('error', 'Unable to update testimonial.');
    return res.redirect('/admin/impact');
  }
});

router.post('/admin/impact/testimonials/:id/delete', requireAdmin, async (req, res) => {
  try {
    const item = await Testimonial.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Testimonial not found.');
      return res.redirect('/admin/impact');
    }
    await deleteMediaByUrl(item.imagePath);
    await item.destroy();
    req.flash('success', 'Testimonial deleted.');
    return res.redirect('/admin/impact#testimonials');
  } catch (error) {
    console.error('Testimonial delete error:', error);
    req.flash('error', 'Unable to delete testimonial.');
    return res.redirect('/admin/impact');
  }
});

module.exports = router;

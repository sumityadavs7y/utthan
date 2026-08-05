const express = require('express');
const { Certificate } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { certificateUpload } = require('../middleware/upload');
const { saveUploadedFile, saveUploadedFiles, deleteMediaByUrl } = require('../utils/media');

const router = express.Router();
const MAX_IMAGES = 20;

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

function handleUpload(req, res, next) {
  certificateUpload.array('images', MAX_IMAGES)(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/certificates');
    }
    return next();
  });
}

function handleEditUpload(req, res, next) {
  certificateUpload.single('image')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/certificates');
    }
    return next();
  });
}

router.get('/certificates', async (req, res) => {
  try {
    const items = await Certificate.findAll({
      order: [['id', 'DESC']]
    });

    renderPage(res, 'certificates', {
      title: 'Certificates - Utthan Foundation',
      currentPage: 'certificates',
      items,
      extraCss: [
        '/vendor/lightgallery/css/lightgallery.min.css',
        '/vendor/magnific-popup/magnific-popup.min.css',
        '/vendor/bootstrap-select/css/bootstrap-select.min.css'
      ],
      extraJs: [
        '/vendor/magnific-popup/magnific-popup.js',
        '/vendor/lightgallery/js/lightgallery-all.min.js'
      ]
    });
  } catch (error) {
    console.error('Certificates load error:', error);
    req.flash('error', 'Unable to load certificates.');
    renderPage(res, 'certificates', {
      title: 'Certificates - Utthan Foundation',
      currentPage: 'certificates',
      items: [],
      extraCss: [
        '/vendor/lightgallery/css/lightgallery.min.css',
        '/vendor/magnific-popup/magnific-popup.min.css',
        '/vendor/bootstrap-select/css/bootstrap-select.min.css'
      ],
      extraJs: [
        '/vendor/magnific-popup/magnific-popup.js',
        '/vendor/lightgallery/js/lightgallery-all.min.js'
      ]
    });
  }
});

router.post('/certificates', requireAdmin, handleUpload, async (req, res) => {
  try {
    const title = (req.body.title || '').trim() || null;
    const files = req.files || [];

    if (!files.length) {
      req.flash('error', 'Please select at least one certificate image to upload.');
      return res.redirect('/certificates');
    }

    const urls = await saveUploadedFiles(files);
    await Certificate.bulkCreate(
      urls.map((imagePath) => ({
        userId: req.session.userId,
        title,
        imagePath
      }))
    );

    req.flash('success', urls.length === 1 ? 'Certificate uploaded.' : `${urls.length} certificates uploaded.`);
    return res.redirect('/certificates');
  } catch (error) {
    console.error('Certificate upload error:', error);
    req.flash('error', 'Unable to upload certificates. Please try again.');
    return res.redirect('/certificates');
  }
});

router.post('/certificates/:id/edit', requireAdmin, handleEditUpload, async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      req.flash('error', 'Invalid certificate.');
      return res.redirect('/certificates');
    }

    const item = await Certificate.findByPk(itemId);
    if (!item) {
      req.flash('error', 'Certificate not found.');
      return res.redirect('/certificates');
    }

    item.title = (req.body.title || '').trim() || null;

    if (req.file) {
      await deleteMediaByUrl(item.imagePath);
      item.imagePath = await saveUploadedFile(req.file);
    }

    await item.save();
    req.flash('success', 'Certificate updated.');
    return res.redirect('/certificates');
  } catch (error) {
    console.error('Certificate edit error:', error);
    req.flash('error', 'Unable to update certificate. Please try again.');
    return res.redirect('/certificates');
  }
});

router.post('/certificates/:id/delete', requireAdmin, async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      req.flash('error', 'Invalid certificate.');
      return res.redirect('/certificates');
    }

    const item = await Certificate.findByPk(itemId);
    if (!item) {
      req.flash('error', 'Certificate not found.');
      return res.redirect('/certificates');
    }

    await deleteMediaByUrl(item.imagePath);
    await item.destroy();

    req.flash('success', 'Certificate deleted.');
    return res.redirect('/certificates');
  } catch (error) {
    console.error('Certificate delete error:', error);
    req.flash('error', 'Unable to delete certificate. Please try again.');
    return res.redirect('/certificates');
  }
});

module.exports = router;

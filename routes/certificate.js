const express = require('express');
const path = require('path');
const fs = require('fs');
const { Certificate } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { certificateUpload, ensureCertificateUploadDir } = require('../middleware/upload');

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

function removeImageFile(imagePath) {
  if (!imagePath) return;
  if (!String(imagePath).startsWith('/uploads/certificates/')) return;
  const absolute = path.join(__dirname, '../public', imagePath.replace(/^\//, ''));
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
}

function cleanupUploadedFiles(files) {
  (files || []).forEach((file) => removeImageFile(`/uploads/certificates/${file.filename}`));
}

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
    ensureCertificateUploadDir();
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

    await Certificate.bulkCreate(
      files.map((file) => ({
        userId: req.session.userId,
        title,
        imagePath: `/uploads/certificates/${file.filename}`
      }))
    );

    req.flash('success', files.length === 1 ? 'Certificate uploaded.' : `${files.length} certificates uploaded.`);
    return res.redirect('/certificates');
  } catch (error) {
    console.error('Certificate upload error:', error);
    cleanupUploadedFiles(req.files);
    req.flash('error', 'Unable to upload certificates. Please try again.');
    return res.redirect('/certificates');
  }
});

router.post('/certificates/:id/edit', requireAdmin, handleEditUpload, async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      if (req.file) removeImageFile(`/uploads/certificates/${req.file.filename}`);
      req.flash('error', 'Invalid certificate.');
      return res.redirect('/certificates');
    }

    const item = await Certificate.findByPk(itemId);
    if (!item) {
      if (req.file) removeImageFile(`/uploads/certificates/${req.file.filename}`);
      req.flash('error', 'Certificate not found.');
      return res.redirect('/certificates');
    }

    item.title = (req.body.title || '').trim() || null;

    if (req.file) {
      removeImageFile(item.imagePath);
      item.imagePath = `/uploads/certificates/${req.file.filename}`;
    }

    await item.save();
    req.flash('success', 'Certificate updated.');
    return res.redirect('/certificates');
  } catch (error) {
    console.error('Certificate edit error:', error);
    if (req.file) removeImageFile(`/uploads/certificates/${req.file.filename}`);
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

    removeImageFile(item.imagePath);
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

const express = require('express');
const { Gallery } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { galleryUpload } = require('../middleware/upload');
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
  galleryUpload.array('images', MAX_IMAGES)(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/gallery');
    }
    return next();
  });
}

function handleEditUpload(req, res, next) {
  galleryUpload.single('image')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/gallery');
    }
    return next();
  });
}

router.get('/gallery', async (req, res) => {
  try {
    const items = await Gallery.findAll({
      order: [['id', 'DESC']]
    });

    renderPage(res, 'gallery', {
      title: 'Gallery - Utthan Foundation',
      currentPage: 'gallery',
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
    console.error('Gallery load error:', error);
    req.flash('error', 'Unable to load the gallery.');
    renderPage(res, 'gallery', {
      title: 'Gallery - Utthan Foundation',
      currentPage: 'gallery',
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

router.post('/gallery', requireAdmin, handleUpload, async (req, res) => {
  try {
    const title = (req.body.title || '').trim() || null;
    const files = req.files || [];

    if (!files.length) {
      req.flash('error', 'Please select at least one image to upload.');
      return res.redirect('/gallery');
    }

    const urls = await saveUploadedFiles(files);
    await Gallery.bulkCreate(
      urls.map((imagePath) => ({
        userId: req.session.userId,
        title,
        imagePath
      }))
    );

    req.flash('success', urls.length === 1 ? 'Image uploaded.' : `${urls.length} images uploaded.`);
    return res.redirect('/gallery');
  } catch (error) {
    console.error('Gallery upload error:', error);
    req.flash('error', 'Unable to upload images. Please try again.');
    return res.redirect('/gallery');
  }
});

router.post('/gallery/:id/edit', requireAdmin, handleEditUpload, async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      req.flash('error', 'Invalid gallery item.');
      return res.redirect('/gallery');
    }

    const item = await Gallery.findByPk(itemId);
    if (!item) {
      req.flash('error', 'Gallery item not found.');
      return res.redirect('/gallery');
    }

    item.title = (req.body.title || '').trim() || null;

    if (req.file) {
      await deleteMediaByUrl(item.imagePath);
      item.imagePath = await saveUploadedFile(req.file);
    }

    await item.save();
    req.flash('success', 'Gallery image updated.');
    return res.redirect('/gallery');
  } catch (error) {
    console.error('Gallery edit error:', error);
    req.flash('error', 'Unable to update gallery image. Please try again.');
    return res.redirect('/gallery');
  }
});

router.post('/gallery/:id/delete', requireAdmin, async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      req.flash('error', 'Invalid gallery item.');
      return res.redirect('/gallery');
    }

    const item = await Gallery.findByPk(itemId);
    if (!item) {
      req.flash('error', 'Gallery item not found.');
      return res.redirect('/gallery');
    }

    await deleteMediaByUrl(item.imagePath);
    await item.destroy();

    req.flash('success', 'Gallery image deleted.');
    return res.redirect('/gallery');
  } catch (error) {
    console.error('Gallery delete error:', error);
    req.flash('error', 'Unable to delete gallery image. Please try again.');
    return res.redirect('/gallery');
  }
});

module.exports = router;

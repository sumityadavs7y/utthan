const express = require('express');
const { Campaign } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { campaignUpload } = require('../middleware/upload');
const { saveUploadedFile, deleteMediaByUrl } = require('../utils/media');

const router = express.Router();

const CATEGORIES = ['Education', 'Medical', 'Rescue', 'Donations', 'Charity', 'Health'];

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

function firstFile(files, field) {
  return files && files[field] && files[field][0] ? files[field][0] : null;
}

function handleUpload(req, res, next) {
  campaignUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'authorImage', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/campaigns');
    }
    return next();
  });
}

function parseAmount(value) {
  const amount = Number(String(value || '').replace(/[^\d.-]/g, ''));
  if (Number.isNaN(amount) || amount < 0) return 0;
  return Math.round(amount);
}

function normalizeCategory(value) {
  const raw = (value || '').trim();
  const match = CATEGORIES.find((item) => item.toLowerCase() === raw.toLowerCase());
  return match || raw || 'Charity';
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en-IN');
}

function progressPercent(raised, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((Number(raised || 0) / Number(goal)) * 100));
}

function serializeCampaign(campaign) {
  return {
    id: campaign.id,
    title: campaign.title,
    category: campaign.category,
    filterClass: String(campaign.category || '').replace(/\s+/g, ''),
    imagePath: campaign.imagePath,
    goalAmount: campaign.goalAmount,
    raisedAmount: campaign.raisedAmount,
    goalDisplay: formatMoney(campaign.goalAmount),
    raisedDisplay: formatMoney(campaign.raisedAmount),
    progress: progressPercent(campaign.raisedAmount, campaign.goalAmount),
    authorName: campaign.authorName,
    authorImagePath: campaign.authorImagePath,
    location: campaign.location,
    sortOrder: campaign.sortOrder
  };
}

router.get('/campaigns', async (req, res) => {
  try {
    const rows = await Campaign.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });
    const campaigns = rows.map(serializeCampaign);
    const categories = [...new Set(campaigns.map((item) => item.category))].sort();

    renderPage(res, 'campaigns', {
      title: 'Our Campaigns - Utthan Foundation',
      currentPage: 'campaigns',
      campaigns,
      categories,
      categoryOptions: CATEGORIES,
      extraCss: [
        '/vendor/magnific-popup/magnific-popup.min.css',
        '/vendor/bootstrap-select/css/bootstrap-select.min.css'
      ],
      extraJs: [
        '/vendor/bootstrap-select/js/bootstrap-select.min.js',
        '/vendor/magnific-popup/magnific-popup.js',
        '/vendor/masonry/masonry-4.2.2.js',
        '/vendor/masonry/isotope.pkgd.min.js',
        '/vendor/imagesloaded/imagesloaded.js'
      ]
    });
  } catch (error) {
    console.error('Campaigns page error:', error);
    req.flash('error', 'Unable to load campaigns.');
    renderPage(res, 'campaigns', {
      title: 'Our Campaigns - Utthan Foundation',
      currentPage: 'campaigns',
      campaigns: [],
      categories: [],
      categoryOptions: CATEGORIES,
      extraCss: [
        '/vendor/magnific-popup/magnific-popup.min.css',
        '/vendor/bootstrap-select/css/bootstrap-select.min.css'
      ],
      extraJs: [
        '/vendor/bootstrap-select/js/bootstrap-select.min.js',
        '/vendor/magnific-popup/magnific-popup.js',
        '/vendor/masonry/masonry-4.2.2.js',
        '/vendor/masonry/isotope.pkgd.min.js',
        '/vendor/imagesloaded/imagesloaded.js'
      ]
    });
  }
});

router.post('/campaigns', requireAdmin, handleUpload, async (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const category = normalizeCategory(req.body.category);
    const authorName = (req.body.authorName || '').trim() || null;
    const location = (req.body.location || '').trim() || null;
    const goalAmount = parseAmount(req.body.goalAmount);
    const raisedAmount = parseAmount(req.body.raisedAmount);
    const sortOrder = Number(req.body.sortOrder) || 0;
    const imageFile = firstFile(req.files, 'image');
    const authorImageFile = firstFile(req.files, 'authorImage');

    if (!title) {
      req.flash('error', 'Campaign title is required.');
      return res.redirect('/campaigns');
    }

    if (!imageFile) {
      req.flash('error', 'Campaign image is required.');
      return res.redirect('/campaigns');
    }

    await Campaign.create({
      title,
      category,
      imagePath: await saveUploadedFile(imageFile),
      goalAmount,
      raisedAmount,
      authorName,
      authorImagePath: authorImageFile ? await saveUploadedFile(authorImageFile) : null,
      location,
      sortOrder
    });

    req.flash('success', 'Campaign created.');
    return res.redirect('/campaigns');
  } catch (error) {
    console.error('Campaign create error:', error);
    req.flash('error', 'Unable to create campaign.');
    return res.redirect('/campaigns');
  }
});

router.post('/campaigns/:id/edit', requireAdmin, handleUpload, async (req, res) => {
  try {
    const campaignId = Number(req.params.id);
    if (!campaignId || Number.isNaN(campaignId)) {
      req.flash('error', 'Invalid campaign.');
      return res.redirect('/campaigns');
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      req.flash('error', 'Campaign not found.');
      return res.redirect('/campaigns');
    }

    const title = (req.body.title || '').trim();
    if (!title) {
      req.flash('error', 'Campaign title is required.');
      return res.redirect('/campaigns');
    }

    const imageFile = firstFile(req.files, 'image');
    const authorImageFile = firstFile(req.files, 'authorImage');

    campaign.title = title;
    campaign.category = normalizeCategory(req.body.category);
    campaign.goalAmount = parseAmount(req.body.goalAmount);
    campaign.raisedAmount = parseAmount(req.body.raisedAmount);
    campaign.authorName = (req.body.authorName || '').trim() || null;
    campaign.location = (req.body.location || '').trim() || null;

    const sortOrder = Number(req.body.sortOrder);
    if (!Number.isNaN(sortOrder)) {
      campaign.sortOrder = sortOrder;
    }

    if (imageFile) {
      await deleteMediaByUrl(campaign.imagePath);
      campaign.imagePath = await saveUploadedFile(imageFile);
    }

    if (authorImageFile) {
      await deleteMediaByUrl(campaign.authorImagePath);
      campaign.authorImagePath = await saveUploadedFile(authorImageFile);
    }

    await campaign.save();
    req.flash('success', 'Campaign updated.');
    return res.redirect('/campaigns');
  } catch (error) {
    console.error('Campaign edit error:', error);
    req.flash('error', 'Unable to update campaign.');
    return res.redirect('/campaigns');
  }
});

router.post('/campaigns/:id/delete', requireAdmin, async (req, res) => {
  try {
    const campaignId = Number(req.params.id);
    if (!campaignId || Number.isNaN(campaignId)) {
      req.flash('error', 'Invalid campaign.');
      return res.redirect('/campaigns');
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      req.flash('error', 'Campaign not found.');
      return res.redirect('/campaigns');
    }

    await deleteMediaByUrl(campaign.imagePath);
    await deleteMediaByUrl(campaign.authorImagePath);
    await campaign.destroy();

    req.flash('success', 'Campaign deleted.');
    return res.redirect('/campaigns');
  } catch (error) {
    console.error('Campaign delete error:', error);
    req.flash('error', 'Unable to delete campaign.');
    return res.redirect('/campaigns');
  }
});

module.exports = router;

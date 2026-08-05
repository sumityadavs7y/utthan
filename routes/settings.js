const express = require('express');
const { SiteConfig } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { getSiteConfig, serializeSiteConfig } = require('../utils/siteConfig');

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

function cleanUrl(value) {
  const trimmed = (value || '').trim();
  return trimmed || null;
}

router.get('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const site = await getSiteConfig();
    renderPage(res, 'admin-settings', {
      title: 'Site Settings - Utthan Foundation',
      currentPage: 'admin-settings',
      settings: site
    });
  } catch (error) {
    console.error('Site settings load error:', error);
    req.flash('error', 'Unable to load site settings.');
    return res.redirect('/account');
  }
});

router.post('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    const email = (req.body.email || '').trim();
    const address = (req.body.address || '').trim();
    const addressShort = (req.body.addressShort || '').trim() || null;
    const mapEmbedUrl = cleanUrl(req.body.mapEmbedUrl);
    const facebookUrl = cleanUrl(req.body.facebookUrl);
    const instagramUrl = cleanUrl(req.body.instagramUrl);
    const twitterUrl = cleanUrl(req.body.twitterUrl);
    const linkedinUrl = cleanUrl(req.body.linkedinUrl);
    const youtubeUrl = cleanUrl(req.body.youtubeUrl);

    if (!phone || !email || !address) {
      req.flash('error', 'Phone, email, and address are required.');
      return res.redirect('/admin/settings');
    }

    let config = await SiteConfig.findOne({ order: [['id', 'ASC']] });
    const payload = {
      phone,
      email,
      address,
      addressShort,
      mapEmbedUrl,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl
    };

    if (!config) {
      config = await SiteConfig.create(payload);
    } else {
      Object.assign(config, payload);
      await config.save();
    }

    // Refresh locals for this response cycle
    res.locals.site = serializeSiteConfig(config);

    req.flash('success', 'Site settings updated.');
    return res.redirect('/admin/settings');
  } catch (error) {
    console.error('Site settings update error:', error);
    req.flash('error', 'Unable to update site settings.');
    return res.redirect('/admin/settings');
  }
});

module.exports = router;

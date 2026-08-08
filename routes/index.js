const express = require('express');
const router = express.Router();
const { Chairman, Campaign, TeamMember, Post, User, ImpactStat, Testimonial } = require('../models');
const { formatDayIst, formatMonthIst } = require('../utils/helpers');

const HOME_CAMPAIGN_LIMIT = 8;
const HOME_POST_LIMIT = 6;

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

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en-IN');
}

function progressPercent(raised, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((Number(raised || 0) / Number(goal)) * 100));
}

function truncateText(text, max = 110) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function parseImages(imagePath) {
  if (!imagePath) return [];
  if (Array.isArray(imagePath)) return imagePath.filter(Boolean);
  const raw = String(imagePath).trim();
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }
  return [raw];
}

function serializeHomeCampaign(campaign) {
  return {
    id: campaign.id,
    title: campaign.title,
    category: campaign.category,
    imagePath: campaign.imagePath,
    goalDisplay: formatMoney(campaign.goalAmount),
    raisedDisplay: formatMoney(campaign.raisedAmount),
    progress: progressPercent(campaign.raisedAmount, campaign.goalAmount),
    authorName: campaign.authorName,
    authorImagePath: campaign.authorImagePath,
    location: campaign.location
  };
}

function serializeHomePost(post, currentUser) {
  const images = parseImages(post.imagePath);
  const createdAt = post.createdAt || new Date();
  const author = post.author || {};
  const showAuthor = Boolean(currentUser && author.name);
  const title = String(post.title || '').trim() || truncateText(post.content, 72) || 'Latest update';

  return {
    id: post.id,
    excerpt: truncateText(post.content, 120),
    title,
    imagePath: images[0] || '/images/blog/blog-grid/pic1.jpg',
    category: post.category || 'Charity',
    day: formatDayIst(createdAt),
    month: formatMonthIst(createdAt),
    authorName: showAuthor ? author.name : 'Utthan Foundation'
  };
}

function serializeTestimonial(item) {
  const quote = String(item.quote || '').trim();
  const excerptMax = 160;
  const needsMore = quote.length > excerptMax;
  return {
    id: item.id,
    title: item.title,
    quote,
    excerpt: needsMore ? `${quote.slice(0, excerptMax - 1).trimEnd()}…` : quote,
    needsMore,
    name: item.name,
    role: item.role,
    imagePath: item.imagePath
  };
}

router.get('/', async (req, res) => {
  let campaigns = [];
  let boardMembers = [];
  let posts = [];
  let impactStats = [];
  let testimonials = [];

  try {
    const [campaignRows, memberRows, postRows, statRows, testimonialRows] = await Promise.all([
      Campaign.findAll({
        order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        limit: HOME_CAMPAIGN_LIMIT
      }),
      TeamMember.findAll({
        where: { category: 'board' },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      }),
      Post.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: HOME_POST_LIMIT
      }),
      ImpactStat.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] }),
      Testimonial.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] })
    ]);

    campaigns = campaignRows.map(serializeHomeCampaign);
    boardMembers = memberRows;
    posts = postRows.map((post) => serializeHomePost(post, res.locals.currentUser));
    impactStats = statRows;
    testimonials = testimonialRows.map(serializeTestimonial);
  } catch (error) {
    console.error('Home page data load error:', error);
  }

  renderPage(res, 'home', {
    title: 'Utthan Foundation - For The Ones In Need',
    currentPage: 'home',
    isHome: true,
    skin: 'skin-3',
    loaderStyle: 'page-3',
    campaigns,
    boardMembers,
    posts,
    impactStats,
    testimonials,
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css',
      '/vendor/animate/animate.css'
    ],
    extraJs: [
      '/vendor/wow/wow.js',
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/counter/waypoints-min.js',
      '/vendor/counter/counterup.min.js',
      '/vendor/swiper/swiper-bundle.min.js',
      '/js/dz.carousel.js'
    ]
  });
});

router.get('/about-us', async (req, res) => {
  let chairman = null;
  try {
    chairman = await Chairman.findOne({ order: [['id', 'ASC']] });
  } catch (error) {
    console.error('About us chairman load error:', error);
  }

  renderPage(res, 'about-us', {
    title: 'About Us - Utthan Foundation',
    currentPage: 'about-us',
    chairman,
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/counter/waypoints-min.js',
      '/vendor/counter/counterup.min.js',
      '/vendor/swiper/swiper-bundle.min.js',
      '/js/dz.carousel.js'
    ]
  });
});

router.get('/member', async (req, res) => {
  let impactStats = [];
  try {
    impactStats = await ImpactStat.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
  } catch (error) {
    console.error('Member page stats load error:', error);
  }

  renderPage(res, 'member', {
    title: 'Become A Member - Utthan Foundation',
    currentPage: 'member',
    impactStats,
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/counter/waypoints-min.js',
      '/vendor/counter/counterup.min.js'
    ]
  });
});

router.get('/donate', (req, res) => {
  renderPage(res, 'donate', {
    title: 'Donate - Utthan Foundation',
    currentPage: 'donate',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js'
    ]
  });
});

router.get('/contact', (req, res) => {
  renderPage(res, 'contact', {
    title: 'Contact Us - Utthan Foundation',
    currentPage: 'contact',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/swiper/swiper-bundle.min.js',
      '/js/dz.carousel.js'
    ]
  });
});

router.get('/privacy-policy', (req, res) => {
  renderPage(res, 'privacy-policy', {
    title: 'Privacy Policy - Utthan Foundation',
    currentPage: 'privacy'
  });
});

router.get('/terms', (req, res) => {
  renderPage(res, 'terms', {
    title: 'Terms & Conditions - Utthan Foundation',
    currentPage: 'terms'
  });
});

router.get('/faq', (req, res) => {
  const { FAQS, buildFaqJsonLd } = require('../utils/faq');
  renderPage(res, 'faq', {
    title: 'FAQ - Utthan Foundation',
    currentPage: 'faq',
    faqs: FAQS,
    faqJsonLd: buildFaqJsonLd(FAQS)
  });
});

router.get('/sitemap.xml', (req, res) => {
  const { buildSitemapXml } = require('../utils/seo');
  res.type('application/xml').send(buildSitemapXml());
});

router.get('/robots.txt', (req, res) => {
  const { buildRobotsTxt } = require('../utils/seo');
  res.type('text/plain').send(buildRobotsTxt());
});

router.get('/feed.xml', async (req, res) => {
  try {
    const { Post } = require('../models');
    const { buildBlogRssXml } = require('../utils/seo');
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit: 20,
      attributes: ['id', 'title', 'content', 'createdAt']
    });
    res.type('application/rss+xml').send(buildBlogRssXml(posts, res.locals.site));
  } catch (error) {
    console.error('RSS feed error:', error);
    res.status(500).type('text/plain').send('Unable to generate feed.');
  }
});

module.exports = router;

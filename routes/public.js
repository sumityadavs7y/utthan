const { Op } = require('sequelize');
const {
  SiteConfig,
  Campaign,
  Post,
  Gallery,
  TeamMember,
  Chairman,
  ImpactStat,
  Testimonial,
  ContactMessage,
  VolunteerApplication,
  Office,
  Partner,
  PageBlock
} = require('../models');
const { rateLimit } = require('../middleware/rateLimit');
const { verifyCsrf } = require('../middleware/auth');
const {
  formatCurrencyINR,
  campaignProgress,
  decorateTimelineItems,
  photoUrls,
  campaignDateLabel
} = require('../utils/helpers');
const { mediaUrl, resolveImageUrl } = require('../utils/media');
const { decorateBlock, blockMap } = require('../utils/pageBlocks');
const {
  PAGE_SEO,
  buildPageSeo,
  organizationJsonLd,
  breadcrumbJsonLd,
  campaignJsonLd,
  webPageJsonLd,
  truncate,
  buildSitemapXml,
  siteOrigin
} = require('../utils/seo');

const formLimiter = rateLimit({ windowMs: 60 * 1000, max: 8 });

async function loadSiteConfig() {
  return SiteConfig.findOne({ order: [['id', 'ASC']] });
}

async function loadBlocks(pageKey) {
  const rows = await PageBlock.findAll({
    where: { pageKey },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']]
  });
  return blockMap(rows.map((row) => decorateBlock(row, mediaUrl)));
}

function decorateCampaign(campaign) {
  const plain = campaign.get ? campaign.get({ plain: true }) : { ...campaign };
  plain.progress = campaignProgress(plain.raisedAmount, plain.goalAmount);
  plain.goalFormatted = formatCurrencyINR(plain.goalAmount);
  plain.raisedFormatted = formatCurrencyINR(plain.raisedAmount);
  plain.timelineItems = decorateTimelineItems(plain.timeline, mediaUrl);
  plain.photos = photoUrls(plain.photoPaths, mediaUrl);
  plain.imageUrl = resolveImageUrl(plain);
  plain.dateLabel = campaignDateLabel(plain);
  return plain;
}

function decoratePerson(person) {
  const plain = person.get ? person.get({ plain: true }) : { ...person };
  plain.imageUrl = resolveImageUrl(plain);
  return plain;
}

function decorateStory(story) {
  const plain = story.get ? story.get({ plain: true }) : { ...story };
  plain.imageUrl = resolveImageUrl(plain);
  return plain;
}

function decoratePartner(partner) {
  const plain = partner.get ? partner.get({ plain: true }) : { ...partner };
  plain.logoUrl = mediaUrl(plain.logoId);
  return plain;
}

function withSeo(res, pageKey, extras = {}) {
  const defaults = PAGE_SEO[pageKey] || {};
  const seo = buildPageSeo({
    seoTitle: extras.seoTitle || defaults.title,
    description: extras.description || defaults.description,
    path: extras.path || defaults.path || '/',
    image: extras.image,
    type: extras.type,
    noindex: extras.noindex,
    breadcrumbs: extras.breadcrumbs
  });

  const siteConfig = res.locals.siteConfig;
  let jsonLd = extras.jsonLd;
  if (!jsonLd) {
    jsonLd = [
      organizationJsonLd(siteConfig),
      webPageJsonLd({
        title: seo.seoTitle,
        description: seo.metaDescription,
        path: extras.path || defaults.path || '/'
      })
    ];
    if (extras.breadcrumbs) {
      const crumbs = breadcrumbJsonLd(extras.breadcrumbs);
      if (crumbs) jsonLd.push(crumbs);
    }
  }

  return {
    ...seo,
    jsonLd
  };
}

function createPublicRouter(express) {
  const router = express.Router();

  router.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /health',
        'Disallow: /login',
        'Disallow: /logout',
        'Disallow: /admin',
        'Disallow: /cms',
        '',
        `Sitemap: ${siteOrigin()}/sitemap.xml`,
        ''
      ].join('\n')
    );
  });

  router.get('/sitemap.xml', async (req, res, next) => {
    try {
      const campaigns = await Campaign.findAll({
        attributes: ['slug', 'updatedAt'],
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      });

      const staticUrls = [
        { loc: '/', changefreq: 'weekly', priority: '1.0' },
        { loc: '/about/who-we-are', changefreq: 'monthly', priority: '0.8' },
        { loc: '/about/history', changefreq: 'monthly', priority: '0.7' },
        { loc: '/about/leadership', changefreq: 'monthly', priority: '0.7' },
        { loc: '/about/team', changefreq: 'monthly', priority: '0.7' },
        { loc: '/campaigns', changefreq: 'weekly', priority: '0.9' },
        { loc: '/blogs', changefreq: 'weekly', priority: '0.8' },
        { loc: '/donate', changefreq: 'monthly', priority: '0.9' },
        { loc: '/contact', changefreq: 'monthly', priority: '0.8' }
      ];

      const campaignUrls = campaigns.map((campaign) => ({
        loc: `/campaigns/${campaign.slug}`,
        lastmod: campaign.updatedAt,
        changefreq: 'weekly',
        priority: '0.8'
      }));

      res
        .type('application/xml')
        .send(buildSitemapXml([...staticUrls, ...campaignUrls]));
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const [ongoing, stats, testimonials, partners, blocks, featureRows] = await Promise.all([
        Campaign.findAll({
          where: { status: 'ongoing' },
          order: [['sortOrder', 'ASC'], ['id', 'ASC']],
          limit: 8
        }),
        ImpactStat.findAll({ order: [['sortOrder', 'ASC']] }),
        Testimonial.findAll({ order: [['sortOrder', 'ASC']], limit: 8 }),
        Partner.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] }),
        loadBlocks('home'),
        PageBlock.findAll({
          where: {
            pageKey: 'home',
            blockKey: { [Op.like]: 'what-we-do-%' }
          },
          order: [['sortOrder', 'ASC'], ['id', 'ASC']]
        })
      ]);

      const hero = blocks.hero;
      const features = featureRows
        .filter((row) => row.blockKey !== 'what-we-do-heading')
        .map((row) => decorateBlock(row, mediaUrl));

      res.render('home', {
        title: 'Home',
        ...withSeo(res, 'home', {
          image: hero && hero.imageUrl ? hero.imageUrl : undefined
        }),
        blocks,
        features,
        ongoingCampaigns: ongoing.map(decorateCampaign),
        stats,
        testimonials: testimonials.map(decorateStory),
        partners: partners.map(decoratePartner)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about', (req, res) => {
    res.redirect(301, '/about/who-we-are');
  });

  router.get('/about/who-we-are', async (req, res, next) => {
    try {
      res.render('about/who-we-are', {
        title: 'Who We Are',
        aboutSection: 'who-we-are',
        blocks: await loadBlocks('who-we-are'),
        ...withSeo(res, 'whoWeAre', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/who-we-are' },
            { name: 'Who We Are', path: '/about/who-we-are' }
          ]
        })
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about/history', async (req, res, next) => {
    try {
      res.render('about/history', {
        title: 'History',
        aboutSection: 'history',
        blocks: await loadBlocks('history'),
        ...withSeo(res, 'history', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/who-we-are' },
            { name: 'History', path: '/about/history' }
          ]
        })
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about/leadership', async (req, res, next) => {
    try {
      const [chairman, advisory, governing, blocks] = await Promise.all([
        Chairman.findOne({ order: [['id', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'advisory' }, order: [['sortOrder', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'governing' }, order: [['sortOrder', 'ASC']] }),
        loadBlocks('leadership')
      ]);

      const chair = chairman
        ? { ...chairman.get({ plain: true }), imageUrl: resolveImageUrl(chairman.get({ plain: true }), 'photoId', 'photoPath') }
        : null;

      res.render('about/leadership', {
        title: 'Leadership',
        aboutSection: 'leadership',
        blocks,
        ...withSeo(res, 'leadership', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/who-we-are' },
            { name: 'Leadership', path: '/about/leadership' }
          ]
        }),
        chairman: chair,
        advisory: advisory.map(decoratePerson),
        governing: governing.map(decoratePerson)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about/team', async (req, res, next) => {
    try {
      const [team, volunteers, blocks] = await Promise.all([
        TeamMember.findAll({ where: { category: 'board' }, order: [['sortOrder', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'volunteer' }, order: [['sortOrder', 'ASC']] }),
        loadBlocks('team')
      ]);

      res.render('about/team', {
        title: 'Team',
        aboutSection: 'team',
        blocks,
        ...withSeo(res, 'team', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/who-we-are' },
            { name: 'Team', path: '/about/team' }
          ]
        }),
        team: team.map(decoratePerson),
        volunteers: volunteers.map(decoratePerson)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/campaigns', async (req, res, next) => {
    try {
      const status = ['ongoing', 'completed', 'upcoming'].includes(req.query.status)
        ? req.query.status
        : 'ongoing';

      const [campaigns, blocks] = await Promise.all([
        Campaign.findAll({
          where: { status },
          order: [['sortOrder', 'ASC'], ['id', 'ASC']]
        }),
        loadBlocks('campaigns')
      ]);

      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      res.render('campaigns', {
        title: 'Campaigns',
        status,
        blocks,
        ...withSeo(res, 'campaigns', {
          seoTitle:
            status === 'ongoing'
              ? PAGE_SEO.campaigns.title
              : `${statusLabel} Campaigns | The Utthan Foundation`,
          description:
            status === 'ongoing'
              ? PAGE_SEO.campaigns.description
              : `Browse ${status} campaigns from The Utthan Foundation — community relief, education, and livelihood drives across Uttar Pradesh.`,
          path: '/campaigns',
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Campaigns', path: '/campaigns' }
          ]
        }),
        campaigns: campaigns.map(decorateCampaign)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/campaigns/:slug', async (req, res, next) => {
    try {
      const campaign = await Campaign.findOne({ where: { slug: req.params.slug } });
      if (!campaign) {
        return res.status(404).render('error', {
          title: 'Not Found',
          statusCode: 404,
          message: 'Campaign not found.',
          ...buildPageSeo({
            seoTitle: 'Campaign Not Found · The Utthan Foundation',
            description: 'The requested campaign could not be found.',
            path: req.path,
            noindex: true
          }),
          jsonLd: []
        });
      }

      const decorated = decorateCampaign(campaign);
      const path = `/campaigns/${decorated.slug}`;
      const description = truncate(
        decorated.summary ||
          `Support ${decorated.title} — a The Utthan Foundation campaign serving communities in Uttar Pradesh.`,
        160
      );

      res.render('campaign-detail', {
        title: decorated.title,
        campaign: decorated,
        ...withSeo(res, null, {
          seoTitle: `${decorated.title} | Donate | The Utthan Foundation`,
          description,
          path,
          image: decorated.imageUrl,
          type: 'article',
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Campaigns', path: '/campaigns' },
            { name: decorated.title, path }
          ],
          jsonLd: [
            organizationJsonLd(res.locals.siteConfig),
            webPageJsonLd({
              title: `${decorated.title} | The Utthan Foundation`,
              description,
              path
            }),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Campaigns', path: '/campaigns' },
              { name: decorated.title, path }
            ]),
            campaignJsonLd(decorated)
          ].filter(Boolean)
        })
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/blogs', async (req, res, next) => {
    try {
      const tab = req.query.tab === 'media' ? 'media' : 'blogs';
      const perPage = tab === 'media' ? 9 : 6;
      const requestedPage = Math.max(1, parseInt(req.query.page, 10) || 1);

      let posts = [];
      let media = [];
      let total = 0;

      if (tab === 'blogs') {
        const result = await Post.findAndCountAll({
          order: [['createdAt', 'DESC']],
          limit: perPage,
          offset: (requestedPage - 1) * perPage
        });
        total = result.count;
        posts = result.rows.map((post) => {
          const plain = post.get({ plain: true });
          const content = String(plain.content || '');
          const limit = 160;
          plain.isTruncated = content.length > limit;
          plain.preview = plain.isTruncated ? `${content.slice(0, limit).trim()}…` : content;
          plain.dateFormatted = new Date(plain.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          plain.photos = photoUrls(plain.photoPaths, mediaUrl);
          if (!plain.photos.length) {
            const cover = resolveImageUrl(plain);
            if (cover) plain.photos = [cover];
          }
          plain.imageUrl = plain.photos[0] || '';
          return plain;
        });
      } else {
        const result = await Gallery.findAndCountAll({
          order: [['mediaDate', 'DESC'], ['id', 'DESC']],
          limit: perPage,
          offset: (requestedPage - 1) * perPage
        });
        total = result.count;
        media = result.rows.map((item) => {
          const plain = item.get({ plain: true });
          plain.dateFormatted = plain.mediaDate
            ? new Date(plain.mediaDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : null;
          plain.imageUrl = resolveImageUrl(plain);
          return plain;
        });
      }

      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const page = Math.min(requestedPage, totalPages);
      if (page !== requestedPage && total > 0) {
        return res.redirect(`/blogs?tab=${tab}&page=${page}`);
      }

      const pagination = {
        page,
        perPage,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevHref: page > 1 ? `/blogs?tab=${tab}&page=${page - 1}` : null,
        nextHref: page < totalPages ? `/blogs?tab=${tab}&page=${page + 1}` : null,
        pages: Array.from({ length: totalPages }, (_, i) => {
          const number = i + 1;
          return {
            number,
            href: `/blogs?tab=${tab}&page=${number}`,
            isCurrent: number === page
          };
        })
      };

      res.render('blogs', {
        title: 'Blogs & Media',
        blocks: await loadBlocks('blogs'),
        ...withSeo(res, 'blogs', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Blogs & Media', path: '/blogs' }
          ]
        }),
        tab,
        posts,
        media,
        pagination
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/donate', async (req, res, next) => {
    try {
      const campaignSlug = req.query.campaign || null;
      let campaign = null;
      if (campaignSlug) {
        const found = await Campaign.findOne({ where: { slug: campaignSlug } });
        if (found) campaign = decorateCampaign(found);
      }

      const blocks = await loadBlocks('donate');
      const seoExtras = campaign
        ? {
            seoTitle: `Donate to ${campaign.title} | The Utthan Foundation`,
            description: truncate(
              `Donate to ${campaign.title}. ${campaign.summary || ''} Support The Utthan Foundation’s work across Uttar Pradesh.`,
              160
            ),
            path: '/donate',
            image: campaign.imageUrl,
            breadcrumbs: [
              { name: 'Home', path: '/' },
              { name: 'Donate', path: '/donate' },
              { name: campaign.title, path: `/campaigns/${campaign.slug}` }
            ]
          }
        : {
            breadcrumbs: [
              { name: 'Home', path: '/' },
              { name: 'Donate', path: '/donate' }
            ]
          };

      res.render('donate', {
        title: 'Donate',
        campaign,
        blocks,
        ...withSeo(res, 'donate', seoExtras)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/contact', async (req, res, next) => {
    try {
      const [offices, blocks] = await Promise.all([
        Office.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] }),
        loadBlocks('contact')
      ]);
      res.render('contact', {
        title: 'Contact Us',
        form: req.flash('form')[0] || {},
        offices,
        blocks,
        ...withSeo(res, 'contact', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' }
          ]
        })
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/contact', formLimiter, verifyCsrf, async (req, res, next) => {
    try {
      const firstName = String(req.body.firstName || '').trim();
      const lastName = String(req.body.lastName || '').trim();
      const email = String(req.body.email || '').trim();
      const phone = String(req.body.phone || '').trim();
      const message = String(req.body.message || '').trim();

      if (!firstName || !email || !message) {
        req.flash('error', 'Please fill in name, email, and message.');
        req.flash('form', { firstName, lastName, email, phone, message });
        return res.redirect('/contact');
      }

      await ContactMessage.create({
        firstName,
        lastName: lastName || null,
        email,
        phone: phone || null,
        message,
        source: 'contact'
      });

      req.flash('success', 'Thank you — your message was received (placeholder inbox).');
      return res.redirect('/contact');
    } catch (err) {
      next(err);
    }
  });

  router.post('/join/volunteer', formLimiter, verifyCsrf, async (req, res, next) => {
    try {
      const name = String(req.body.name || '').trim();
      const email = String(req.body.email || '').trim();
      const phone = String(req.body.phone || '').trim();
      const company = String(req.body.company || '').trim();
      const message = String(req.body.message || '').trim();

      if (!name || !email || !message) {
        req.flash('error', 'Please fill in name, email, and a short message.');
        return res.redirect('/contact#join');
      }

      await VolunteerApplication.create({
        name,
        email,
        phone: phone || null,
        company: company || null,
        message
      });

      req.flash('success', 'Volunteer interest received — we will follow up (placeholder).');
      return res.redirect('/contact#join');
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = {
  createPublicRouter,
  loadSiteConfig
};

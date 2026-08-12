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
  VolunteerApplication
} = require('../models');
const { rateLimit } = require('../middleware/rateLimit');
const {
  formatCurrencyINR,
  campaignProgress,
  parseTimeline,
  parsePhotoList
} = require('../utils/helpers');
const partners = require('../data/partners');
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

function decorateCampaign(campaign) {
  const plain = campaign.get ? campaign.get({ plain: true }) : { ...campaign };
  plain.progress = campaignProgress(plain.raisedAmount, plain.goalAmount);
  plain.goalFormatted = formatCurrencyINR(plain.goalAmount);
  plain.raisedFormatted = formatCurrencyINR(plain.raisedAmount);
  plain.timelineItems = parseTimeline(plain.timeline);
  plain.photos = parsePhotoList(plain.photoPaths);
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
      const [ongoing, stats, testimonials, whatWeDo] = await Promise.all([
        Campaign.findAll({
          where: { status: 'ongoing' },
          order: [['sortOrder', 'ASC'], ['id', 'ASC']],
          limit: 8
        }),
        ImpactStat.findAll({ order: [['sortOrder', 'ASC']] }),
        Testimonial.findAll({ order: [['sortOrder', 'ASC']], limit: 8 }),
        Campaign.findAll({
          order: [['sortOrder', 'ASC']],
          limit: 4
        })
      ]);

      res.render('home', {
        title: 'Home',
        ...withSeo(res, 'home', {
          image: '/images/food-aid-kit-handover.jpg'
        }),
        ongoingCampaigns: ongoing.map(decorateCampaign),
        stats,
        testimonials,
        whatWeDo: whatWeDo.map(decorateCampaign),
        partners
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about', (req, res) => {
    res.redirect(301, '/about/who-we-are');
  });

  router.get('/about/who-we-are', (req, res) => {
    res.render('about/who-we-are', {
      title: 'Who We Are',
      aboutSection: 'who-we-are',
      ...withSeo(res, 'whoWeAre', {
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about/who-we-are' },
          { name: 'Who We Are', path: '/about/who-we-are' }
        ]
      })
    });
  });

  router.get('/about/history', (req, res) => {
    res.render('about/history', {
      title: 'History',
      aboutSection: 'history',
      ...withSeo(res, 'history', {
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about/who-we-are' },
          { name: 'History', path: '/about/history' }
        ]
      })
    });
  });

  router.get('/about/leadership', async (req, res, next) => {
    try {
      const [chairman, advisory] = await Promise.all([
        Chairman.findOne({ order: [['id', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'advisory' }, order: [['sortOrder', 'ASC']] })
      ]);

      res.render('about/leadership', {
        title: 'Leadership',
        aboutSection: 'leadership',
        ...withSeo(res, 'leadership', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/who-we-are' },
            { name: 'Leadership', path: '/about/leadership' }
          ]
        }),
        chairman,
        advisory
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about/team', async (req, res, next) => {
    try {
      const [team, volunteers] = await Promise.all([
        TeamMember.findAll({ where: { category: 'board' }, order: [['sortOrder', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'volunteer' }, order: [['sortOrder', 'ASC']] })
      ]);

      res.render('about/team', {
        title: 'Team',
        aboutSection: 'team',
        ...withSeo(res, 'team', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/who-we-are' },
            { name: 'Team', path: '/about/team' }
          ]
        }),
        team,
        volunteers
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

      const campaigns = await Campaign.findAll({
        where: { status },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']]
      });

      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      res.render('campaigns', {
        title: 'Campaigns',
        status,
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
          image: decorated.imagePath,
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
      const [posts, media] = await Promise.all([
        Post.findAll({ order: [['createdAt', 'DESC']] }),
        Gallery.findAll({ order: [['mediaDate', 'DESC'], ['id', 'DESC']] })
      ]);

      res.render('blogs', {
        title: 'Blogs & Media',
        ...withSeo(res, 'blogs', {
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Blogs & Media', path: '/blogs' }
          ]
        }),
        posts,
        media
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

      const seoExtras = campaign
        ? {
            seoTitle: `Donate to ${campaign.title} | The Utthan Foundation`,
            description: truncate(
              `Donate to ${campaign.title}. ${campaign.summary || ''} Support The Utthan Foundation’s work across Uttar Pradesh.`,
              160
            ),
            path: '/donate',
            image: campaign.imagePath,
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
        ...withSeo(res, 'donate', seoExtras)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/contact', async (req, res) => {
    res.render('contact', {
      title: 'Contact Us',
      form: req.flash('form')[0] || {},
      ...withSeo(res, 'contact', {
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' }
        ]
      })
    });
  });

  router.post('/contact', formLimiter, async (req, res, next) => {
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

  router.post('/join/volunteer', formLimiter, async (req, res, next) => {
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

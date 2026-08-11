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

function createPublicRouter(express) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const [ongoing, stats, testimonials, whatWeDo] = await Promise.all([
        Campaign.findAll({
          where: { status: 'ongoing' },
          order: [['sortOrder', 'ASC'], ['id', 'ASC']],
          limit: 8
        }),
        ImpactStat.findAll({ order: [['sortOrder', 'ASC']] }),
        Testimonial.findAll({ order: [['sortOrder', 'ASC']], limit: 3 }),
        Campaign.findAll({
          order: [['sortOrder', 'ASC']],
          limit: 4
        })
      ]);

      res.render('home', {
        title: 'Home',
        ongoingCampaigns: ongoing.map(decorateCampaign),
        stats,
        testimonials,
        whatWeDo: whatWeDo.map(decorateCampaign)
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/about', async (req, res, next) => {
    try {
      const [chairman, advisory, team, volunteers] = await Promise.all([
        Chairman.findOne({ order: [['id', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'advisory' }, order: [['sortOrder', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'board' }, order: [['sortOrder', 'ASC']] }),
        TeamMember.findAll({ where: { category: 'volunteer' }, order: [['sortOrder', 'ASC']] })
      ]);

      res.render('about', {
        title: 'About Us',
        chairman,
        advisory,
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

      res.render('campaigns', {
        title: 'Campaigns',
        status,
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
          message: 'Campaign not found.'
        });
      }

      res.render('campaign-detail', {
        title: campaign.title,
        campaign: decorateCampaign(campaign)
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

      res.render('donate', {
        title: 'Donate',
        campaign
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/contact', async (req, res) => {
    res.render('contact', {
      title: 'Contact Us',
      form: req.flash('form')[0] || {}
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

require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const flash = require('connect-flash');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const { envConfig, ensureSqliteDir } = require('./config');
const { sequelize, testConnection, PageBlock } = require('./models');
const { runMigrations } = require('./utils/migrate');
const { bootstrapCms } = require('./utils/bootstrapCms');
const { securityHeaders } = require('./middleware/security');
const { loadCurrentUser } = require('./middleware/auth');
const { createPublicRouter, loadSiteConfig } = require('./routes/public');
const { createAuthRouter } = require('./routes/auth');
const { createCmsRouter } = require('./routes/cms');
const { createAdminRouter } = require('./routes/admin');
const { createMediaRouter } = require('./routes/media');
const { formatCurrencyINR, campaignProgress, bodyParagraphs } = require('./utils/helpers');
const { socialLinksFromConfig, buildPageSeo } = require('./utils/seo');
const { mediaUrl } = require('./utils/media');
const { decorateBlock } = require('./utils/pageBlocks');

ensureSqliteDir();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: envConfig.envMode === 'production' ? '7d' : 0,
  etag: true
}));

const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
  secret: envConfig.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: envConfig.envMode === 'production'
  }
}));
app.use(flash());
app.use(loadCurrentUser);

app.use(async (req, res, next) => {
  try {
    const siteConfig = await loadSiteConfig();
    const config = siteConfig && siteConfig.get ? siteConfig.get({ plain: true }) : siteConfig;
    if (config) {
      config.logoUrl = mediaUrl(config.logoId) || '/images/logo.png';
      config.qrUrl = mediaUrl(config.qrImageId) || config.qrImagePath || '';
    }
    const footerRow = await PageBlock.findOne({ where: { pageKey: 'site', blockKey: 'footer' } });
    res.locals.siteConfig = config;
    res.locals.footerBlock = decorateBlock(footerRow, mediaUrl);
    res.locals.socialLinks = socialLinksFromConfig(config);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path;
    res.locals.siteName = 'The Utthan Foundation';
    res.locals.formatCurrencyINR = formatCurrencyINR;
    res.locals.campaignProgress = campaignProgress;
    res.locals.bodyParagraphs = bodyParagraphs;
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(503).json({ status: 'error', message: 'database unavailable' });
  }
});

app.use(createMediaRouter(express));
app.use(createAuthRouter(express));
app.use('/admin', createAdminRouter(express));
app.use('/cms', createCmsRouter(express));
app.use(createPublicRouter(express));

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    statusCode: 404,
    message: 'The page you requested was not found.',
    ...buildPageSeo({
      seoTitle: 'Page Not Found · The Utthan Foundation',
      description: 'The page you requested was not found on The Utthan Foundation website.',
      path: req.path,
      noindex: true
    }),
    jsonLd: []
  });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Server Error',
    statusCode: 500,
    message: envConfig.envMode === 'development' ? err.message : 'Something went wrong.',
    ...buildPageSeo({
      seoTitle: 'Server Error · The Utthan Foundation',
      description: 'Something went wrong while loading this page.',
      path: req.path,
      noindex: true
    }),
    jsonLd: []
  });
});

const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Utthan Foundation...');
    console.log(`   ENV_MODE: ${envConfig.envMode}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await testConnection();
    await runMigrations();
    await sessionStore.sync();
    await bootstrapCms();

    app.listen(envConfig.port, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server is running on port ${envConfig.port}`);
      if (envConfig.envMode === 'development') {
        console.log('   Dev mode enabled');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

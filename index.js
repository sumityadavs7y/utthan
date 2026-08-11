require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const flash = require('connect-flash');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const { envConfig, ensureSqliteDir, ensureUploadsDirs } = require('./config');
const { sequelize, testConnection } = require('./models');
const { runMigrations } = require('./utils/migrate');
const { securityHeaders } = require('./middleware/security');
const { createPublicRouter, loadSiteConfig } = require('./routes/public');
const { formatCurrencyINR, campaignProgress } = require('./utils/helpers');
const { socialLinksFromConfig, buildPageSeo } = require('./utils/seo');

ensureSqliteDir();
ensureUploadsDirs();

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
    sameSite: 'lax'
  }
}));
app.use(flash());

app.use(async (req, res, next) => {
  try {
    const siteConfig = await loadSiteConfig();
    res.locals.siteConfig = siteConfig;
    res.locals.socialLinks = socialLinksFromConfig(siteConfig);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path;
    res.locals.siteName = 'The Utthan Foundation';
    res.locals.formatCurrencyINR = formatCurrencyINR;
    res.locals.campaignProgress = campaignProgress;
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

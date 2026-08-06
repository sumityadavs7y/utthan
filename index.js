require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const { envConfig, ensureSqliteDir } = require('./config');
ensureSqliteDir();

const app = express();
const { sequelize, testConnection, User } = require('./models');
const { runMigrations } = require('./utils/migrate');
const { seedDefaultAdmin } = require('./utils/seedAdmin');
const { seedDefaultGallery } = require('./utils/seedGallery');
const { seedDefaultTeam } = require('./utils/seedTeam');
const { seedDefaultCampaigns } = require('./utils/seedCampaign');
const { seedDefaultCertificates } = require('./utils/seedCertificate');
const { migrateImagesToMedia } = require('./utils/migrateImagesToMedia');
const { seedDefaultSiteConfig, getSiteConfig } = require('./utils/siteConfig');
const { seedDefaultImpact } = require('./utils/seedImpact');
const {
  resolvePageSeo,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  buildWebPageJsonLd,
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd
} = require('./utils/seo');
const { isDevEnvMode } = require('./utils/helpers');
const compression = require('compression');
const { securityHeaders } = require('./middleware/security');

app.use(securityHeaders);
app.use(compression());
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use(express.static(__dirname + '/public', {
  maxAge: isDevEnvMode() ? 0 : '7d',
  etag: true,
  setHeaders(res, filePath) {
    if (/\.(?:js|css|woff2?|ttf|eot|png|jpe?g|gif|webp|svg|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', isDevEnvMode() ? 'no-cache' : 'public, max-age=604800, immutable');
    }
  }
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

// Required when behind nginx/load balancer so secure cookies and req.secure work.
if (!isDevEnvMode()) {
  app.set('trust proxy', 1);
}

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Sessions'
});

app.use(session({
  secret: envConfig.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    // 'auto' sets Secure only on HTTPS (needs trust proxy behind TLS termination).
    secure: isDevEnvMode() ? false : 'auto',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.currentPath = req.path || '/';
  res.locals.canonicalPath = req.path || '/';
  res.locals.seoHelpers = {
    resolvePageSeo,
    buildOrganizationJsonLd,
    buildWebsiteJsonLd,
    buildWebPageJsonLd,
    buildBreadcrumbJsonLd,
    buildLocalBusinessJsonLd
  };
  next();
});

app.use(async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = null;

  try {
    res.locals.site = await getSiteConfig();
  } catch (error) {
    console.error('Site config load error:', error);
    res.locals.site = await Promise.resolve(require('./utils/siteConfig').serializeSiteConfig(null));
  }

  if (!req.session.userId) {
    return next();
  }

  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user) {
      delete req.session.userId;
      return next();
    }

    res.locals.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
});

const siteRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const galleryRoutes = require('./routes/gallery');
const teamRoutes = require('./routes/team');
const campaignRoutes = require('./routes/campaign');
const certificateRoutes = require('./routes/certificate');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');
const formsRoutes = require('./routes/forms');
const impactRoutes = require('./routes/impact');
app.use('/', siteRoutes);
app.use('/', authRoutes);
app.use('/', blogRoutes);
app.use('/', galleryRoutes);
app.use('/', teamRoutes);
app.use('/', campaignRoutes);
app.use('/', certificateRoutes);
app.use('/', mediaRoutes);
app.use('/', settingsRoutes);
app.use('/', formsRoutes);
app.use('/', impactRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found - Utthan Foundation',
    currentPage: 'not-found',
    skin: 'skin-1',
    loaderStyle: 'page-1',
    isHome: false,
    extraCss: [],
    extraJs: [],
    canonicalPath: req.path || '/404'
  });
});

const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Utthan...');
    console.log(`   ENV_MODE: ${envConfig.envMode}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await testConnection();
    await runMigrations();
    await sessionStore.sync();
    await seedDefaultAdmin();
    await seedDefaultSiteConfig();
    await seedDefaultImpact();
    await seedDefaultGallery();
    await seedDefaultTeam();
    await seedDefaultCampaigns();
    await seedDefaultCertificates();
    await migrateImagesToMedia();

    app.listen(envConfig.port, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server is running on port ${envConfig.port}`);
      if (isDevEnvMode()) {
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

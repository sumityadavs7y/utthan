require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const { envConfig } = require('./config');
const { sequelize, testConnection, User } = require('./models');
const { runMigrations } = require('./utils/migrate');
const { seedDefaultAdmin } = require('./utils/seedAdmin');
const { seedDefaultGallery } = require('./utils/seedGallery');
const { seedDefaultTeam } = require('./utils/seedTeam');
const { seedDefaultCampaigns } = require('./utils/seedCampaign');
const { seedDefaultCertificates } = require('./utils/seedCertificate');
const { isDevEnvMode } = require('./utils/helpers');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', 'views');

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
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use(async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = null;

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
const { ensureUploadDir, ensureGalleryUploadDir, ensureTeamUploadDir, ensureCampaignUploadDir, ensureCertificateUploadDir } = require('./middleware/upload');
app.use('/', siteRoutes);
app.use('/', authRoutes);
app.use('/', blogRoutes);
app.use('/', galleryRoutes);
app.use('/', teamRoutes);
app.use('/', campaignRoutes);
app.use('/', certificateRoutes);

const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Utthan...');
    console.log(`   ENV_MODE: ${envConfig.envMode}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await testConnection();
    await runMigrations();
    await sessionStore.sync();
    ensureUploadDir();
    ensureGalleryUploadDir();
    ensureTeamUploadDir();
    ensureCampaignUploadDir();
    ensureCertificateUploadDir();
    await seedDefaultAdmin();
    await seedDefaultGallery();
    await seedDefaultTeam();
    await seedDefaultCampaigns();
    await seedDefaultCertificates();

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

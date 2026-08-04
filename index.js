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
app.use('/', siteRoutes);
app.use('/', authRoutes);

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

require('dotenv').config();

const express = require('express');
const app = express();
const { envConfig } = require('./config');
const { testConnection } = require('./models');
const { runMigrations } = require('./utils/migrate');
const { isDevEnvMode } = require('./utils/helpers');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', 'views');

const siteRoutes = require('./routes/index');
app.use('/', siteRoutes);

const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Utthan...');
    console.log(`   ENV_MODE: ${envConfig.envMode}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await testConnection();
    await runMigrations();

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

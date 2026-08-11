require('dotenv').config();

const express = require('express');
const { envConfig, ensureSqliteDir, ensureUploadsDirs } = require('./config');
const { sequelize, testConnection } = require('./models');
const { runMigrations } = require('./utils/migrate');

ensureSqliteDir();
ensureUploadsDirs();

const app = express();

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(503).json({ status: 'error', message: 'database unavailable' });
  }
});

app.get('/', (req, res) => {
  res.type('text').send('Hello World');
});

app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Hello World...');
    console.log(`   ENV_MODE: ${envConfig.envMode}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await testConnection();
    await runMigrations();
    // Tables are created only via migrations. None are defined yet.

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

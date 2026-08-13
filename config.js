const path = require('path');
const fs = require('fs');

const sqliteStorage = path.join(__dirname, 'database', 'app.db');

exports.envConfig = {
  port: process.env.PORT || '3000',
  envMode: process.env.ENV_MODE || 'production',
  sessionSecret: process.env.SESSION_SECRET || 'change-me-in-production',
  adminEmail: process.env.ADMIN_EMAIL || 'test@test.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  siteUrl: process.env.SITE_URL || process.env.APP_URL || 'https://theutthanfoundation.in'
};

exports.databaseConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'utthan',
  username: process.env.DB_USER || 'utthanuser',
  password: process.env.DB_PASSWORD,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  storage: process.env.DB_DIALECT === 'sqlite' ? sqliteStorage : undefined
};

exports.ensureSqliteDir = function ensureSqliteDir() {
  if ((process.env.DB_DIALECT || 'postgres') !== 'sqlite') return;
  fs.mkdirSync(path.dirname(sqliteStorage), { recursive: true });
};

exports.ensureUploadsDirs = function ensureUploadsDirs() {
  // Content photos are stored in the database (MediaAssets).
};

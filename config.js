exports.envConfig = {
  port: process.env.PORT || '3000',
  envMode: process.env.ENV_MODE || 'production'
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
  storage: process.env.DB_DIALECT === 'sqlite' ? './database/app.db' : undefined
};

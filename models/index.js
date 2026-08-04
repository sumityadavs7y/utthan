const { sequelize, Sequelize, testConnection } = require('./sequelize');
const User = require('./user');

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  User
};

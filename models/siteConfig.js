const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const SiteConfig = sequelize.define('SiteConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressShort: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mapEmbedUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facebookUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagramUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twitterUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedinUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  youtubeUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'SiteConfigs'
});

module.exports = SiteConfig;

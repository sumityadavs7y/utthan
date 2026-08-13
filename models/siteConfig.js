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
  },
  upiId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ifsc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qrImagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qrImageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  logoId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  donationLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  memberFeeNote: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'SiteConfigs'
});

module.exports = SiteConfig;

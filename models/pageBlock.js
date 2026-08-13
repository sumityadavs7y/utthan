const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const PageBlock = sequelize.define('PageBlock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pageKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  blockKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eyebrow: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lede: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  extra: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'PageBlocks',
  indexes: [
    { unique: true, fields: ['pageKey', 'blockKey'] }
  ]
});

module.exports = PageBlock;

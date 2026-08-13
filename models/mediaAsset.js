const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const MediaAsset = sequelize.define('MediaAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sourceKey: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  byteSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false
  }
}, {
  tableName: 'MediaAssets'
});

module.exports = MediaAsset;

const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  goalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  raisedAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  authorImagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'Campaigns'
});

module.exports = Campaign;

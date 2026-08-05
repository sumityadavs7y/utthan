const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const ImpactStat = sequelize.define('ImpactStat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  prefix: {
    type: DataTypes.STRING,
    allowNull: true
  },
  suffix: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'ImpactStats'
});

module.exports = ImpactStat;

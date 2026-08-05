const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Certificates'
});

module.exports = Certificate;

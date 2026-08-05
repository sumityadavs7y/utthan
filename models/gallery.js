const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Gallery = sequelize.define('Gallery', {
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
  tableName: 'Galleries'
});

module.exports = Gallery;

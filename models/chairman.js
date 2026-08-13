const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Chairman = sequelize.define('Chairman', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  photoPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  photoId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true
  },
  signaturePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  signatureId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Chairmen'
});

module.exports = Chairman;

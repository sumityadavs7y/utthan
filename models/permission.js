const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  group: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General'
  }
}, {
  tableName: 'Permissions'
});

module.exports = Permission;

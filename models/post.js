const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Charity'
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Posts'
});

module.exports = Post;

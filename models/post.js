const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Untitled Post'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Charity'
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  photoPaths: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Posts'
});

module.exports = Post;

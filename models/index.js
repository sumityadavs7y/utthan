const { sequelize, Sequelize, testConnection } = require('./sequelize');
const User = require('./user');
const Post = require('./post');
const Gallery = require('./gallery');
const Chairman = require('./chairman');
const TeamMember = require('./teamMember');
const Campaign = require('./campaign');
const Certificate = require('./certificate');

User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Gallery, { foreignKey: 'userId', as: 'galleryItems' });
Gallery.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  User,
  Post,
  Gallery,
  Chairman,
  TeamMember,
  Campaign,
  Certificate
};

const { sequelize, Sequelize, testConnection } = require('./sequelize');
const Post = require('./post');
const Gallery = require('./gallery');
const Chairman = require('./chairman');
const TeamMember = require('./teamMember');
const Campaign = require('./campaign');
const SiteConfig = require('./siteConfig');
const ContactMessage = require('./contactMessage');
const VolunteerApplication = require('./volunteerApplication');
const ImpactStat = require('./impactStat');
const Testimonial = require('./testimonial');
const MediaAsset = require('./mediaAsset');
const Role = require('./role');
const Permission = require('./permission');
const RolePermission = require('./rolePermission');
const User = require('./user');
const Office = require('./office');
const Partner = require('./partner');
const PageBlock = require('./pageBlock');

User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });
RolePermission.belongsTo(Role, { foreignKey: 'roleId' });
RolePermission.belongsTo(Permission, { foreignKey: 'permissionId' });

Partner.belongsTo(MediaAsset, { foreignKey: 'logoId', as: 'logo' });
PageBlock.belongsTo(MediaAsset, { foreignKey: 'imageId', as: 'image' });

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  Post,
  Gallery,
  Chairman,
  TeamMember,
  Campaign,
  SiteConfig,
  ContactMessage,
  VolunteerApplication,
  ImpactStat,
  Testimonial,
  MediaAsset,
  Role,
  Permission,
  RolePermission,
  User,
  Office,
  Partner,
  PageBlock
};

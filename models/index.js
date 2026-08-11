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
  Testimonial
};

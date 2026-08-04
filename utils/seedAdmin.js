const bcrypt = require('bcryptjs');
const { envConfig } = require('../config');
const User = require('../models/user');

async function seedDefaultAdmin() {
  const email = envConfig.adminEmail;
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    console.log(`ℹ️  Default admin already exists (${email}).`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(envConfig.adminPassword, 10);
  const admin = await User.create({
    name: 'Administrator',
    email,
    passwordHash,
    role: 'admin'
  });

  console.log(`✅ Default admin created (${email}).`);
  return admin;
}

module.exports = {
  seedDefaultAdmin
};

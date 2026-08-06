const bcrypt = require('bcryptjs');
const { envConfig } = require('../config');
const User = require('../models/user');

async function seedDefaultAdmin() {
  const email = envConfig.adminEmail;
  const password = envConfig.adminPassword;
  const syncPassword = String(process.env.SYNC_ADMIN_PASSWORD || '').toLowerCase() === 'true';
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    if (syncPassword) {
      existing.passwordHash = await bcrypt.hash(password, 10);
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Default admin password synced from env (${email}).`);
      return existing;
    }

    console.log(`ℹ️  Default admin already exists (${email}).`);
    console.log('   Tip: set SYNC_ADMIN_PASSWORD=true once to reset password from ADMIN_PASSWORD.');
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 10);
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

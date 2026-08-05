const { Certificate, User } = require('../models');

const DEFAULT_CERTIFICATES = Array.from({ length: 12 }, (_, index) => {
  const n = index + 1;
  return {
    title: `Certificate ${n}`,
    imagePath: `/images/certificates/pic${n}.jpg`
  };
});

async function seedDefaultCertificates() {
  const count = await Certificate.count();
  if (count > 0) return;

  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.warn('⚠️  Skipping certificates seed: no admin user found.');
    return;
  }

  await Certificate.bulkCreate(
    DEFAULT_CERTIFICATES.map((item) => ({
      userId: admin.id,
      title: item.title,
      imagePath: item.imagePath
    }))
  );

  console.log(`📜 Seeded ${DEFAULT_CERTIFICATES.length} default certificates.`);
}

module.exports = {
  seedDefaultCertificates
};

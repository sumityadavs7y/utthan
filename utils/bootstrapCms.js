const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { envConfig } = require('../config');
const {
  sequelize,
  Permission,
  Role,
  User,
  MediaAsset,
  Office,
  Partner,
  PageBlock,
  Campaign,
  Post,
  Gallery,
  TeamMember,
  Chairman,
  Testimonial,
  SiteConfig,
  ImpactStat
} = require('../models');
const placeholderSeed = require('../seeders/20260811110000-seed-placeholder-content');
const { parsePhotoList } = require('./helpers');
const { PERMISSIONS, ADMIN_SLUG, EVERYONE_SLUG } = require('./permissions');
const { createMediaFromDisk, findMediaIdByPath } = require('./media');
const { PAGE_BLOCK_SEED } = require('./pageBlocks');
const officesSeed = require('../data/offices');
const partnersSeed = require('../data/partners');

const IMAGES_ROOT = path.join(__dirname, '../public/images');
const SKIP_FILES = new Set(['favicon.png']);

function walkImageFiles(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...walkImageFiles(path.join(dir, entry.name), rel));
      continue;
    }
    if (SKIP_FILES.has(entry.name)) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) continue;
    out.push({ abs: path.join(dir, entry.name), sourceKey: rel.replace(/\\/g, '/') });
  }
  return out;
}

async function seedPermissionsAndRoles() {
  for (const perm of PERMISSIONS) {
    await Permission.findOrCreate({
      where: { key: perm.key },
      defaults: perm
    });
  }

  const [adminRole] = await Role.findOrCreate({
    where: { slug: ADMIN_SLUG },
    defaults: { name: 'Admin', slug: ADMIN_SLUG, isSystem: true }
  });
  const [everyoneRole] = await Role.findOrCreate({
    where: { slug: EVERYONE_SLUG },
    defaults: { name: 'Everyone', slug: EVERYONE_SLUG, isSystem: true }
  });

  return { adminRole, everyoneRole };
}

async function seedAdminUser(adminRole) {
  const email = String(envConfig.adminEmail || '').trim().toLowerCase();
  const password = envConfig.adminPassword;
  if (!email || !password) {
    console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD missing — skipping admin user seed.');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ where: { email } });
  if (!existing) {
    await User.create({
      email,
      passwordHash: hash,
      name: 'Administrator',
      roleId: adminRole.id,
      isActive: true
    });
    console.log(`   ✓ Created admin user ${email}`);
    return;
  }

  const updates = { roleId: adminRole.id, isActive: true };
  if (String(process.env.SYNC_ADMIN_PASSWORD).toLowerCase() === 'true') {
    updates.passwordHash = hash;
    console.log(`   ✓ Synced admin password for ${email}`);
  }
  await existing.update(updates);
}

async function importImages() {
  const files = walkImageFiles(IMAGES_ROOT);
  let created = 0;
  for (const file of files) {
    const exists = await MediaAsset.findOne({
      where: { sourceKey: file.sourceKey },
      attributes: ['id']
    });
    if (exists) continue;
    await createMediaFromDisk(file.abs, file.sourceKey);
    created += 1;
  }
  if (created) console.log(`   ✓ Imported ${created} image(s) into MediaAssets`);
}

async function backfillImageIds() {
  async function fill(model, pathField, idField) {
    const rows = await model.findAll();
    for (const row of rows) {
      if (row[idField]) continue;
      const id = await findMediaIdByPath(row[pathField]);
      if (id) await row.update({ [idField]: id });
    }
  }

  await fill(Campaign, 'imagePath', 'imageId');
  await fill(Post, 'imagePath', 'imageId');
  await fill(Gallery, 'imagePath', 'imageId');
  await fill(TeamMember, 'imagePath', 'imageId');
  await fill(Testimonial, 'imagePath', 'imageId');
  await fill(Chairman, 'photoPath', 'photoId');
  await fill(Chairman, 'signaturePath', 'signatureId');
  await fill(SiteConfig, 'qrImagePath', 'qrImageId');

  const campaigns = await Campaign.findAll();
  for (const campaign of campaigns) {
    const raw = campaign.photoPaths;
    if (!raw) continue;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!Array.isArray(parsed) || !parsed.length) continue;
    if (parsed.every((item) => typeof item === 'number' || /^\d+$/.test(String(item)))) continue;
    const ids = [];
    for (const item of parsed) {
      if (typeof item === 'number' || /^\d+$/.test(String(item))) {
        ids.push(Number(item));
        continue;
      }
      const id = await findMediaIdByPath(item);
      if (id) ids.push(id);
    }
    if (ids.length) await campaign.update({ photoPaths: JSON.stringify(ids) });
  }

  const posts = await Post.findAll();
  for (const post of posts) {
    const existing = parsePhotoList(post.photoPaths).map(Number).filter(Boolean);
    if (existing.length) continue;
    if (post.imageId) {
      await post.update({ photoPaths: JSON.stringify([post.imageId]) });
    }
  }

  const config = await SiteConfig.findOne({ order: [['id', 'ASC']] });
  if (config && !config.logoId) {
    const logoId = await findMediaIdByPath('/images/logo.png');
    if (logoId) await config.update({ logoId });
  }
}

async function seedPlaceholderContent() {
  const alreadySeeded = await Campaign.count()
    || await Post.count()
    || await Gallery.count()
    || await SiteConfig.count()
    || await ImpactStat.count();
  if (alreadySeeded) return;

  await placeholderSeed.up(sequelize.getQueryInterface());
  console.log('   ✓ Seeded starter campaigns, blogs, media, team, and site settings');
}

async function seedOffices() {
  const count = await Office.count();
  if (count) return;
  const nowRows = officesSeed.map((office, index) => ({
    label: office.label,
    address: office.address,
    phone: office.phone || null,
    email: office.email || null,
    sortOrder: index + 1
  }));
  await Office.bulkCreate(nowRows);
  console.log('   ✓ Seeded offices');
}

async function seedPartners() {
  const count = await Partner.count();
  if (count) return;
  const rows = [];
  for (let i = 0; i < partnersSeed.length; i += 1) {
    const partner = partnersSeed[i];
    const logoId = partner.logoPath ? await findMediaIdByPath(partner.logoPath) : null;
    rows.push({
      name: partner.name,
      logoId,
      showName: partner.showName !== false,
      sortOrder: i + 1
    });
  }
  await Partner.bulkCreate(rows);
  console.log('   ✓ Seeded partners');
}

async function seedPageBlocks() {
  for (const seed of PAGE_BLOCK_SEED) {
    const imageId = seed.imagePath ? await findMediaIdByPath(seed.imagePath) : null;
    const defaults = {
      pageKey: seed.pageKey,
      blockKey: seed.blockKey,
      eyebrow: seed.eyebrow || null,
      title: seed.title || null,
      lede: seed.lede || null,
      body: seed.body || null,
      extra: seed.extra || null,
      imageId,
      sortOrder: seed.sortOrder || 0
    };
    const [row, created] = await PageBlock.findOrCreate({
      where: { pageKey: seed.pageKey, blockKey: seed.blockKey },
      defaults
    });
    if (!created && !row.imageId && imageId) {
      await row.update({ imageId });
    }
  }
}

async function bootstrapCms() {
  console.log('🔄 Bootstrapping CMS / RBAC...');
  const { adminRole } = await seedPermissionsAndRoles();
  await seedAdminUser(adminRole);
  await importImages();
  await seedPlaceholderContent();
  await seedOffices();
  await seedPartners();
  await seedPageBlocks();
  await backfillImageIds();
  console.log('✅ CMS bootstrap complete.');
}

module.exports = { bootstrapCms };

const fs = require('fs');
const path = require('path');
const { Gallery, Certificate, Campaign, Chairman, TeamMember, Post, Media, Testimonial } = require('../models');
const { isMediaUrl } = require('./media');

const publicRoot = path.join(__dirname, '../public');

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

function parseImageList(imagePath) {
  if (!imagePath) return [];
  if (Array.isArray(imagePath)) return imagePath.filter(Boolean);
  const raw = String(imagePath).trim();
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }
  return [raw];
}

function absoluteFromPublicUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (isMediaUrl(url)) return null;
  if (!url.startsWith('/')) return null;
  // Only migrate local app assets
  if (!url.startsWith('/images/') && !url.startsWith('/uploads/')) return null;
  return path.join(publicRoot, url.replace(/^\//, ''));
}

async function importFileToMedia(url) {
  if (!url || isMediaUrl(url)) return url;

  const absolute = absoluteFromPublicUrl(url);
  if (!absolute) return url;

  if (!fs.existsSync(absolute)) {
    console.warn(`⚠️  Missing image file, skipping: ${url}`);
    return url;
  }

  const buffer = fs.readFileSync(absolute);
  const ext = path.extname(absolute).toLowerCase();
  const mimeType = MIME_BY_EXT[ext] || 'application/octet-stream';

  const media = await Media.create({
    mimeType,
    originalName: path.basename(absolute),
    size: buffer.length,
    data: buffer
  });

  return `/media/${media.id}`;
}

async function migrateField(record, fieldName) {
  const current = record[fieldName];
  if (!current || isMediaUrl(current)) return false;

  const next = await importFileToMedia(current);
  if (next === current) return false;

  record[fieldName] = next;
  return true;
}

async function migrateModel(Model, fields, label) {
  const rows = await Model.findAll();
  let updated = 0;

  for (const row of rows) {
    let changed = false;
    for (const field of fields) {
      const didChange = await migrateField(row, field);
      if (didChange) changed = true;
    }
    if (changed) {
      await row.save();
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`🖼️  Migrated images for ${updated} ${label}.`);
  }

  return updated;
}

async function migratePosts() {
  const posts = await Post.findAll();
  let updated = 0;

  for (const post of posts) {
    const urls = parseImageList(post.imagePath);
    if (!urls.length) continue;

    let changed = false;
    const nextUrls = [];
    for (const url of urls) {
      if (isMediaUrl(url)) {
        nextUrls.push(url);
        continue;
      }
      const next = await importFileToMedia(url);
      if (next !== url) changed = true;
      nextUrls.push(next);
    }

    if (changed) {
      post.imagePath = JSON.stringify(nextUrls);
      await post.save();
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`🖼️  Migrated images for ${updated} blog posts.`);
  }

  return updated;
}

async function migrateImagesToMedia() {
  console.log('🔄 Checking for filesystem images to migrate into Media...');

  const totals = await Promise.all([
    migrateModel(Gallery, ['imagePath'], 'gallery items'),
    migrateModel(Certificate, ['imagePath'], 'certificates'),
    migrateModel(Campaign, ['imagePath', 'authorImagePath'], 'campaigns'),
    migrateModel(Chairman, ['photoPath', 'signaturePath'], 'chairman profiles'),
    migrateModel(TeamMember, ['imagePath'], 'team members'),
    migrateModel(Testimonial, ['imagePath'], 'testimonials'),
    migratePosts()
  ]);

  const updated = totals.reduce((sum, n) => sum + n, 0);
  if (updated === 0) {
    console.log('✅ All dynamic images are already stored in the database.');
  } else {
    console.log(`✅ Finished migrating images into Media (${updated} records updated).`);
  }

  return { updated };
}

module.exports = {
  migrateImagesToMedia
};

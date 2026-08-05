const { SiteConfig } = require('../models');

const DEFAULT_SITE_CONFIG = {
  phone: '+91-7052701010',
  email: 'help@utthanfoundation.in',
  address: 'Shopping Sq 1, Sushant Golf City, Lucknow, Uttar Pradesh, India',
  addressShort: 'Sushant Golf City, Lucknow',
  mapEmbedUrl: 'https://www.google.com/maps?q=Sushant+Golf+City,+Lucknow,+Uttar+Pradesh&output=embed',
  facebookUrl: 'https://www.facebook.com/theutthanfoundation/',
  instagramUrl: 'https://www.instagram.com/theutthanfoundation/',
  twitterUrl: 'https://twitter.com/theutthan',
  linkedinUrl: 'https://www.linkedin.com/in/theutthanfoundation',
  youtubeUrl: 'https://www.youtube.com/@theutthanfoundation'
};

function serializeSiteConfig(row) {
  if (!row) {
    return {
      ...DEFAULT_SITE_CONFIG,
      phoneTel: DEFAULT_SITE_CONFIG.phone.replace(/[^\d+]/g, '')
    };
  }

  const data = row.toJSON ? row.toJSON() : row;
  return {
    phone: data.phone || DEFAULT_SITE_CONFIG.phone,
    email: data.email || DEFAULT_SITE_CONFIG.email,
    address: data.address || DEFAULT_SITE_CONFIG.address,
    addressShort: data.addressShort || data.address || DEFAULT_SITE_CONFIG.addressShort,
    mapEmbedUrl: data.mapEmbedUrl || DEFAULT_SITE_CONFIG.mapEmbedUrl,
    facebookUrl: data.facebookUrl || DEFAULT_SITE_CONFIG.facebookUrl,
    instagramUrl: data.instagramUrl || DEFAULT_SITE_CONFIG.instagramUrl,
    twitterUrl: data.twitterUrl || DEFAULT_SITE_CONFIG.twitterUrl,
    linkedinUrl: data.linkedinUrl || DEFAULT_SITE_CONFIG.linkedinUrl,
    youtubeUrl: data.youtubeUrl || DEFAULT_SITE_CONFIG.youtubeUrl,
    phoneTel: String(data.phone || DEFAULT_SITE_CONFIG.phone).replace(/[^\d+]/g, '')
  };
}

async function getSiteConfig() {
  const row = await SiteConfig.findOne({ order: [['id', 'ASC']] });
  return serializeSiteConfig(row);
}

async function seedDefaultSiteConfig() {
  const count = await SiteConfig.count();
  if (count > 0) return;

  await SiteConfig.create(DEFAULT_SITE_CONFIG);
  console.log('⚙️  Seeded default site settings.');
}

module.exports = {
  DEFAULT_SITE_CONFIG,
  serializeSiteConfig,
  getSiteConfig,
  seedDefaultSiteConfig
};

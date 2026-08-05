const { envConfig } = require('../config');

const DEFAULT_DESCRIPTION =
  'Utthan Foundation supports education, healthcare, livelihood, and community welfare for underprivileged people in Lucknow and across India.';

const DEFAULT_KEYWORDS =
  'Utthan Foundation, NGO Lucknow, charity India, donate, education, healthcare, volunteer, crowdfunding, underprivileged communities';

const PAGE_SEO = {
  home: {
    description:
      'Utthan Foundation — For The Ones In Need. Donate, volunteer, and support education, healthcare, and livelihood programs for underprivileged communities.',
    keywords: DEFAULT_KEYWORDS
  },
  'about-us': {
    description:
      'Learn about Utthan Foundation’s mission, vision, and leadership working to empower disadvantaged communities through education, healthcare, and livelihood.',
    keywords: 'Utthan Foundation about, NGO mission Lucknow, charity organization India'
  },
  team: {
    description:
      'Meet the chairman, board members, and volunteers behind Utthan Foundation’s community programs.',
    keywords: 'Utthan Foundation team, NGO board members, volunteers Lucknow'
  },
  campaigns: {
    description:
      'Browse active Utthan Foundation campaigns and causes. Support education, medical care, rescue, and charity initiatives.',
    keywords: 'Utthan Foundation campaigns, donate to cause, charity fundraiser India'
  },
  gallery: {
    description:
      'Photo gallery of Utthan Foundation programs, events, and community impact across education, healthcare, and outreach.',
    keywords: 'Utthan Foundation gallery, NGO photos, charity events'
  },
  certificates: {
    description:
      'View certificates and recognitions earned by Utthan Foundation for its social work and community programs.',
    keywords: 'Utthan Foundation certificates, NGO recognition'
  },
  blog: {
    description:
      'Latest updates, stories, and media from Utthan Foundation’s fieldwork and community initiatives.',
    keywords: 'Utthan Foundation blog, NGO news, charity updates'
  },
  donate: {
    description:
      'Donate to Utthan Foundation. Your contribution helps fund education, healthcare, shelters, and livelihood support.',
    keywords: 'donate Utthan Foundation, charity donation India, NGO donate Lucknow'
  },
  member: {
    description:
      'Become a member or volunteer with Utthan Foundation and help create lasting change for people in need.',
    keywords: 'volunteer Utthan Foundation, become a member, NGO volunteer Lucknow'
  },
  contact: {
    description:
      'Contact Utthan Foundation in Lucknow for donations, volunteering, partnerships, and support inquiries.',
    keywords: 'contact Utthan Foundation, NGO Lucknow address, charity helpline'
  },
  login: {
    description: 'Sign in to your Utthan Foundation account.',
    robots: 'noindex, nofollow'
  },
  account: {
    description: 'Manage your Utthan Foundation account.',
    robots: 'noindex, nofollow'
  },
  'admin-users': { robots: 'noindex, nofollow' },
  'admin-settings': { robots: 'noindex, nofollow' },
  'admin-inbox': { robots: 'noindex, nofollow' },
  'admin-impact': { robots: 'noindex, nofollow' }
};

const PUBLIC_SITEMAP_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.8' },
  { path: '/team', changefreq: 'monthly', priority: '0.7' },
  { path: '/campaigns', changefreq: 'weekly', priority: '0.9' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.6' },
  { path: '/certificates', changefreq: 'monthly', priority: '0.5' },
  { path: '/blog', changefreq: 'daily', priority: '0.8' },
  { path: '/donate', changefreq: 'monthly', priority: '0.9' },
  { path: '/member', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' }
];

function absoluteUrl(pathname = '/') {
  const base = String(envConfig.siteUrl || '').replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

function resolvePageSeo({ currentPage, title, metaDescription, metaKeywords, metaRobots, canonicalPath, ogImage }) {
  const page = PAGE_SEO[currentPage] || {};
  const description = metaDescription || page.description || DEFAULT_DESCRIPTION;
  const keywords = metaKeywords || page.keywords || DEFAULT_KEYWORDS;
  const robots = metaRobots || page.robots || 'index, follow';
  const path = canonicalPath || '/';
  const canonical = absoluteUrl(path);
  const image = ogImage ? (ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage)) : absoluteUrl('/images/logo.png');

  return {
    title: title || 'Utthan Foundation',
    description,
    keywords,
    robots,
    canonical,
    ogImage: image,
    siteName: 'Utthan Foundation',
    locale: 'en_IN'
  };
}

function buildOrganizationJsonLd(site) {
  const sameAs = [
    site.facebookUrl,
    site.instagramUrl,
    site.twitterUrl,
    site.linkedinUrl,
    site.youtubeUrl
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Utthan Foundation',
    alternateName: 'Utthan Foundation - For The Ones In Need',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/logo.png'),
    description: DEFAULT_DESCRIPTION,
    email: site.email,
    telephone: site.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address,
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN'
    },
    sameAs
  };
}

function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Utthan Foundation',
    url: absoluteUrl('/'),
    publisher: {
      '@type': 'Organization',
      name: 'Utthan Foundation',
      logo: absoluteUrl('/images/logo.png')
    }
  };
}

function buildSitemapXml(lastmod = new Date()) {
  const date = lastmod.toISOString().slice(0, 10);
  const urls = PUBLIC_SITEMAP_PATHS.map((item) => `  <url>
    <loc>${absoluteUrl(item.path)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

module.exports = {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  PAGE_SEO,
  PUBLIC_SITEMAP_PATHS,
  absoluteUrl,
  resolvePageSeo,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  buildSitemapXml
};

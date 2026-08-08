const { envConfig } = require('../config');

const DEFAULT_DESCRIPTION =
  'Utthan Foundation supports education, healthcare, livelihood, and community welfare for underprivileged people in Lucknow and across India.';

const DEFAULT_KEYWORDS =
  'Utthan Foundation, NGO Lucknow, charity India, donate, education, healthcare, volunteer, crowdfunding, underprivileged communities';

const PAGE_SEO = {
  home: {
    description:
      'Utthan Foundation — For The Ones In Need. Donate, volunteer, and support education, healthcare, and livelihood programs for underprivileged communities.',
    keywords: DEFAULT_KEYWORDS,
    schemaType: 'WebPage'
  },
  'about-us': {
    description:
      'Learn about Utthan Foundation’s mission, vision, and leadership working to empower disadvantaged communities through education, healthcare, and livelihood.',
    keywords: 'Utthan Foundation about, NGO mission Lucknow, charity organization India',
    schemaType: 'AboutPage',
    breadcrumb: 'About Us'
  },
  team: {
    description:
      'Meet the chairman, board members, and volunteers behind Utthan Foundation’s community programs.',
    keywords: 'Utthan Foundation team, NGO board members, volunteers Lucknow',
    schemaType: 'WebPage',
    breadcrumb: 'Our Team'
  },
  campaigns: {
    description:
      'Browse active Utthan Foundation campaigns and causes. Support education, medical care, rescue, and charity initiatives.',
    keywords: 'Utthan Foundation campaigns, donate to cause, charity fundraiser India',
    schemaType: 'CollectionPage',
    breadcrumb: 'Campaigns'
  },
  gallery: {
    description:
      'Photo gallery of Utthan Foundation programs, events, and community impact across education, healthcare, and outreach.',
    keywords: 'Utthan Foundation gallery, NGO photos, charity events',
    schemaType: 'ImageGallery',
    breadcrumb: 'Gallery'
  },
  certificates: {
    description:
      'View certificates and recognitions earned by Utthan Foundation for its social work and community programs.',
    keywords: 'Utthan Foundation certificates, NGO recognition',
    schemaType: 'CollectionPage',
    breadcrumb: 'Certificates'
  },
  blog: {
    description:
      'Latest updates, stories, and media from Utthan Foundation’s fieldwork and community initiatives.',
    keywords: 'Utthan Foundation blog, NGO news, charity updates',
    schemaType: 'Blog',
    breadcrumb: 'Blog & Media'
  },
  donate: {
    description:
      'Donate to Utthan Foundation. Your contribution helps fund education, healthcare, shelters, and livelihood support.',
    keywords: 'donate Utthan Foundation, charity donation India, NGO donate Lucknow',
    schemaType: 'WebPage',
    breadcrumb: 'Donate'
  },
  member: {
    description:
      'Become a member or volunteer with Utthan Foundation and help create lasting change for people in need.',
    keywords: 'volunteer Utthan Foundation, become a member, NGO volunteer Lucknow',
    schemaType: 'WebPage',
    breadcrumb: 'Become A Member'
  },
  contact: {
    description:
      'Contact Utthan Foundation in Lucknow for donations, volunteering, partnerships, and support inquiries.',
    keywords: 'contact Utthan Foundation, NGO Lucknow address, charity helpline',
    schemaType: 'ContactPage',
    breadcrumb: 'Contact Us'
  },
  faq: {
    description:
      'Frequently asked questions about Utthan Foundation donations, volunteering, transparency, and how to get involved.',
    keywords: 'Utthan Foundation FAQ, NGO donation questions, volunteer FAQ Lucknow',
    schemaType: 'FAQPage',
    breadcrumb: 'FAQ'
  },
  privacy: {
    description:
      'Privacy Policy for Utthan Foundation — how we collect, use, and protect personal information on our website.',
    keywords: 'Utthan Foundation privacy policy, NGO data protection',
    schemaType: 'WebPage',
    breadcrumb: 'Privacy Policy'
  },
  terms: {
    description:
      'Terms and Conditions for using the Utthan Foundation website, donations, volunteering, and related services.',
    keywords: 'Utthan Foundation terms and conditions, NGO website terms',
    schemaType: 'WebPage',
    breadcrumb: 'Terms & Conditions'
  },
  'not-found': {
    description: 'Page not found on the Utthan Foundation website.',
    robots: 'noindex, follow',
    schemaType: 'WebPage',
    breadcrumb: 'Page Not Found'
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
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/faq', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' }
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
    locale: 'en_IN',
    schemaType: page.schemaType || 'WebPage',
    breadcrumbLabel: page.breadcrumb || null,
    currentPage: currentPage || ''
  };
}

function buildOrganizationJsonLd(site = {}) {
  const sameAs = [
    site.facebookUrl,
    site.instagramUrl,
    site.twitterUrl,
    site.linkedinUrl,
    site.youtubeUrl
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': ['NGO', 'Organization'],
    '@id': `${absoluteUrl('/')}#organization`,
    name: 'Utthan Foundation',
    alternateName: 'Utthan Foundation - For The Ones In Need',
    url: absoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/logo.png'),
      width: 512,
      height: 512
    },
    image: absoluteUrl('/images/logo.png'),
    description: DEFAULT_DESCRIPTION,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    foundingLocation: {
      '@type': 'Place',
      name: 'Lucknow, Uttar Pradesh, India'
    },
    areaServed: [
      { '@type': 'City', name: 'Lucknow' },
      { '@type': 'State', name: 'Uttar Pradesh' },
      { '@type': 'Country', name: 'India' }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address || 'Sushant Golf City, Lucknow',
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      postalCode: '226030',
      addressCountry: 'IN'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: site.phone || undefined,
        email: site.email || undefined,
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
      }
    ],
    sameAs,
    knowsAbout: [
      'Education',
      'Healthcare',
      'Livelihood development',
      'Charity',
      'Community welfare',
      'Animal rescue'
    ]
  };
}

function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/')}#website`,
    name: 'Utthan Foundation',
    url: absoluteUrl('/'),
    inLanguage: 'en-IN',
    publisher: { '@id': `${absoluteUrl('/')}#organization` },
    potentialAction: {
      '@type': 'DonateAction',
      target: absoluteUrl('/donate'),
      name: 'Donate to Utthan Foundation'
    }
  };
}

function buildWebPageJsonLd(pageSeo) {
  if (!pageSeo || pageSeo.robots?.includes('noindex')) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': pageSeo.schemaType || 'WebPage',
    '@id': `${pageSeo.canonical}#webpage`,
    url: pageSeo.canonical,
    name: pageSeo.title,
    description: pageSeo.description,
    isPartOf: { '@id': `${absoluteUrl('/')}#website` },
    about: { '@id': `${absoluteUrl('/')}#organization` },
    inLanguage: 'en-IN',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: pageSeo.ogImage
    }
  };

  if (pageSeo.currentPage === 'donate') {
    data.potentialAction = {
      '@type': 'DonateAction',
      name: 'Donate Now',
      target: absoluteUrl('/donate')
    };
  }

  return data;
}

function buildBreadcrumbJsonLd(pageSeo) {
  if (!pageSeo?.breadcrumbLabel || pageSeo.canonical === absoluteUrl('/')) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/')
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageSeo.breadcrumbLabel,
        item: pageSeo.canonical
      }
    ]
  };
}

function buildLocalBusinessJsonLd(site = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${absoluteUrl('/')}#local`,
    name: 'Utthan Foundation',
    image: absoluteUrl('/images/logo.png'),
    url: absoluteUrl('/'),
    telephone: site.phone || undefined,
    email: site.email || undefined,
    priceRange: 'Donations',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address || 'Sushant Golf City, Lucknow',
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.7875,
      longitude: 81.0231
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '18:00'
    },
    parentOrganization: { '@id': `${absoluteUrl('/')}#organization` }
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

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Disallow: /login
Disallow: /account
Disallow: /admin/
Disallow: /api/
Disallow: /logout

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildBlogRssXml(posts = [], site = {}) {
  const items = posts.map((post) => {
    const title = escapeXml((post.title || post.content || 'Utthan Foundation update').slice(0, 80));
    const description = escapeXml((post.content || '').slice(0, 300));
    const link = absoluteUrl('/blog');
    const pubDate = post.createdAt ? new Date(post.createdAt).toUTCString() : new Date().toUTCString();
    return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">post-${post.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Utthan Foundation Blog</title>
    <link>${absoluteUrl('/blog')}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>en-in</language>
    <managingEditor>${escapeXml(site.email || 'help@utthanfoundation.in')} (Utthan Foundation)</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
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
  buildWebPageJsonLd,
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd,
  buildSitemapXml,
  buildRobotsTxt,
  buildBlogRssXml
};

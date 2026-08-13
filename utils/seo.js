const { envConfig } = require('../config');

const SITE_NAME = 'The Utthan Foundation';
const DEFAULT_OG_IMAGE = '/images/logo.png';
const DEFAULT_DESCRIPTION =
  'The Utthan Foundation is an NGO in Uttar Pradesh working on food security, education, livelihood, and community care. Donate, volunteer, or support a campaign near you.';

const PAGE_SEO = {
  home: {
    title: 'The Utthan Foundation | NGO in Uttar Pradesh for Food, Education & Care',
    description:
      'The Utthan Foundation is an NGO in Uttar Pradesh for food security, education, livelihood, and care. Donate or volunteer today.',
    path: '/'
  },
  whoWeAre: {
    title: 'Who We Are | The Utthan Foundation NGO Uttar Pradesh',
    description:
      'Learn about The Utthan Foundation’s mission. We unite neighbors across Uttar Pradesh for food security, education, livelihood, and care.',
    path: '/about/who-we-are'
  },
  history: {
    title: 'Our History | The Utthan Foundation',
    description:
      'The story of The Utthan Foundation — how a community-led NGO grew to serve villages and neighborhoods across Uttar Pradesh.',
    path: '/about/history'
  },
  leadership: {
    title: 'Leadership & Advisory Committee | The Utthan Foundation',
    description:
      'Meet the leadership and chief advisory committee guiding The Utthan Foundation’s work across Uttar Pradesh.',
    path: '/about/leadership'
  },
  team: {
    title: 'Our Team & Volunteers | The Utthan Foundation',
    description:
      'Meet the board and volunteers behind The Utthan Foundation’s relief, education, and livelihood programs in Uttar Pradesh.',
    path: '/about/team'
  },
  campaigns: {
    title: 'Campaigns | Donate to Ongoing Drives | The Utthan Foundation',
    description:
      'Explore ongoing and upcoming campaigns from The Utthan Foundation — winter relief, school kits, community kitchens, and livelihood workshops.',
    path: '/campaigns'
  },
  blogs: {
    title: 'Blogs & Media | Stories from The Utthan Foundation',
    description:
      'Read field stories, campaign updates, and photo media from The Utthan Foundation’s work across Uttar Pradesh.',
    path: '/blogs'
  },
  donate: {
    title: 'Donate to The Utthan Foundation | Support NGO Work in UP',
    description:
      'Donate to The Utthan Foundation via UPI, QR, or bank transfer. Your gift funds food, education, livelihood, and care in Uttar Pradesh.',
    path: '/donate'
  },
  contact: {
    title: 'Contact & Volunteer | The Utthan Foundation Lucknow',
    description:
      'Contact The Utthan Foundation’s Lucknow office, or join as a volunteer or member serving communities across Uttar Pradesh.',
    path: '/contact'
  }
};

function siteOrigin() {
  return String(envConfig.siteUrl || 'https://theutthanfoundation.in').replace(/\/$/, '');
}

function absoluteUrl(pathname = '/') {
  if (!pathname) return siteOrigin();
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${siteOrigin()}${path}`;
}

function truncate(text, max = 160) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function isMeaningfulSocialUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) return false;
    const path = parsed.pathname.replace(/\/+$/, '');
    return path.length > 0;
  } catch {
    return false;
  }
}

function socialLinksFromConfig(siteConfig) {
  if (!siteConfig) return [];
  const entries = [
    { label: 'Facebook', url: siteConfig.facebookUrl },
    { label: 'Instagram', url: siteConfig.instagramUrl },
    { label: 'X', url: siteConfig.twitterUrl },
    { label: 'LinkedIn', url: siteConfig.linkedinUrl },
    { label: 'YouTube', url: siteConfig.youtubeUrl }
  ];
  return entries.filter((item) => isMeaningfulSocialUrl(item.url));
}

function buildPageSeo(options = {}) {
  const {
    title,
    seoTitle,
    description,
    path = '/',
    image,
    type = 'website',
    noindex = false,
    breadcrumbs
  } = options;

  const resolvedTitle = seoTitle || (title ? `${title} · ${SITE_NAME}` : SITE_NAME);
  const resolvedDescription = truncate(description || DEFAULT_DESCRIPTION);
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    seoTitle: resolvedTitle,
    metaDescription: resolvedDescription,
    canonicalUrl: canonical,
    ogType: type,
    ogImage,
    noindex: Boolean(noindex),
    breadcrumbs: Array.isArray(breadcrumbs) ? breadcrumbs : null
  };
}

function organizationJsonLd(siteConfig) {
  const sameAs = socialLinksFromConfig(siteConfig).map((item) => item.url);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: SITE_NAME,
    alternateName: 'Utthan Foundation',
    url: siteOrigin(),
    logo: absoluteUrl(siteConfig?.logoUrl || '/images/logo.png'),
    image: absoluteUrl(siteConfig?.logoUrl || '/images/logo.png'),
    description: DEFAULT_DESCRIPTION,
    email: siteConfig?.email || 'hello@theutthanfoundation.in',
    telephone: siteConfig?.phone || undefined,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Uttar Pradesh, India'
    },
    address: siteConfig?.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address,
          addressLocality: 'Lucknow',
          addressRegion: 'Uttar Pradesh',
          addressCountry: 'IN'
        }
      : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: siteConfig?.email || 'hello@theutthanfoundation.in',
      telephone: siteConfig?.phone || undefined,
      areaServed: 'IN',
      availableLanguage: ['en', 'hi']
    },
    foundingLocation: {
      '@type': 'Place',
      name: 'Lucknow, Uttar Pradesh'
    }
  };

  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

function breadcrumbJsonLd(items = []) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

function campaignJsonLd(campaign) {
  if (!campaign) return null;
  const url = absoluteUrl(`/campaigns/${campaign.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    name: `Donate to ${campaign.title}`,
    description: truncate(campaign.summary || campaign.description, 200),
    url,
    target: {
      '@type': 'EntryPoint',
      urlTemplate: absoluteUrl(`/donate?campaign=${campaign.slug}`),
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform'
      ]
    },
    recipient: {
      '@type': 'NGO',
      name: SITE_NAME,
      url: siteOrigin()
    },
    object: {
      '@type': 'Thing',
      name: campaign.title,
      description: truncate(campaign.summary || campaign.description, 200),
      url,
      image: campaign.imageUrl || campaign.imagePath
        ? absoluteUrl(campaign.imageUrl || campaign.imagePath)
        : undefined
    }
  };
}

function webPageJsonLd({ title, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteOrigin()
    },
    about: {
      '@type': 'NGO',
      name: SITE_NAME
    }
  };
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemapXml(urls = []) {
  const body = urls
    .map((entry) => {
      const loc = escapeXml(absoluteUrl(entry.loc));
      const lastmod = entry.lastmod
        ? `<lastmod>${escapeXml(new Date(entry.lastmod).toISOString().slice(0, 10))}</lastmod>`
        : '';
      const changefreq = entry.changefreq
        ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>`
        : '';
      const priority =
        entry.priority != null ? `<priority>${escapeXml(entry.priority)}</priority>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    ${lastmod}` : ''}${
        changefreq ? `\n    ${changefreq}` : ''
      }${priority ? `\n    ${priority}` : ''}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

module.exports = {
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
  PAGE_SEO,
  siteOrigin,
  absoluteUrl,
  truncate,
  socialLinksFromConfig,
  buildPageSeo,
  organizationJsonLd,
  breadcrumbJsonLd,
  campaignJsonLd,
  webPageJsonLd,
  buildSitemapXml
};

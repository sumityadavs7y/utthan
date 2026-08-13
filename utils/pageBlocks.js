const { bodyParagraphs } = require('./helpers');

function extra(obj) {
  return JSON.stringify(obj);
}

const PAGE_BLOCK_SEED = [
  {
    pageKey: 'home',
    blockKey: 'hero',
    eyebrow: 'The Utthan Foundation',
    title: 'Neighbors rising together across Uttar Pradesh',
    lede: 'Food security, education, livelihood, and care — an NGO serving villages and neighborhoods from Lucknow outward.',
    imagePath: '/images/food-aid-kit-handover.jpg',
    extra: extra({
      ctaPrimaryLabel: 'Donate Now',
      ctaPrimaryHref: '/donate',
      ctaSecondaryLabel: 'See Campaigns',
      ctaSecondaryHref: '/campaigns'
    }),
    sortOrder: 1
  },
  {
    pageKey: 'home',
    blockKey: 'campaigns-heading',
    title: 'Ongoing campaigns',
    lede: 'Support active relief, education, and livelihood drives across Uttar Pradesh.',
    sortOrder: 2
  },
  {
    pageKey: 'home',
    blockKey: 'what-we-do-heading',
    title: 'What we do',
    lede: 'Four focus areas guiding The Utthan Foundation’s community work in Uttar Pradesh.',
    sortOrder: 3
  },
  {
    pageKey: 'home',
    blockKey: 'what-we-do-1',
    title: 'Food security',
    body: 'Community kitchens and grocery kits for families facing hunger.',
    imagePath: '/images/hot-meal-distribution.jpg',
    extra: extra({ alt: 'Volunteers serving hot meals in a community kitchen' }),
    sortOrder: 4
  },
  {
    pageKey: 'home',
    blockKey: 'what-we-do-2',
    title: 'Education',
    body: 'School kits, classroom support, and community libraries.',
    imagePath: '/images/rural-classroom-teaching.jpg',
    extra: extra({ alt: 'Teacher helping children in a rural classroom' }),
    sortOrder: 5
  },
  {
    pageKey: 'home',
    blockKey: 'what-we-do-3',
    title: 'Livelihood',
    body: 'Skills workshops so women can earn with dignity.',
    imagePath: '/images/women-sewing-workshop.jpg',
    extra: extra({ alt: 'Women learning sewing skills in a livelihood workshop' }),
    sortOrder: 6
  },
  {
    pageKey: 'home',
    blockKey: 'what-we-do-4',
    title: 'Community care',
    body: 'Sanitation drives, relief distribution, and neighborhood action.',
    imagePath: '/images/community-street-cleanup.jpg',
    extra: extra({ alt: 'Neighbors cleaning a street during a community care drive' }),
    sortOrder: 7
  },
  {
    pageKey: 'home',
    blockKey: 'join',
    title: 'Join us',
    lede: 'Volunteer in the field or become a member of The Utthan Foundation.',
    imagePath: '/images/women-sewing-workshop.jpg',
    extra: extra({
      alt: 'Women learning skills together at a community workshop',
      ctaPrimaryLabel: 'Join as Volunteer',
      ctaPrimaryHref: '/contact#join',
      ctaSecondaryLabel: 'Join as Member',
      ctaSecondaryHref: '/contact#join'
    }),
    sortOrder: 8
  },
  {
    pageKey: 'home',
    blockKey: 'stories-heading',
    title: 'Success stories',
    lede: 'Voices from neighbors we serve across Uttar Pradesh.',
    sortOrder: 9
  },
  {
    pageKey: 'home',
    blockKey: 'partners-heading',
    title: 'Our partners',
    lede: 'Organizations and groups walking with The Utthan Foundation across Uttar Pradesh.',
    sortOrder: 10
  },
  {
    pageKey: 'who-we-are',
    blockKey: 'hero',
    eyebrow: 'About Us',
    title: 'Who We Are',
    lede: 'The Utthan Foundation is an NGO working with communities across Uttar Pradesh on food security, education, livelihood, and care.',
    sortOrder: 1
  },
  {
    pageKey: 'who-we-are',
    blockKey: 'mission',
    title: 'Our mission',
    body: 'The Utthan Foundation brings neighbors, volunteers, and partners together so help reaches villages and urban neighborhoods with dignity.\n\nFrom community kitchens and school kits to livelihood workshops and local relief drives, we focus on practical support that families can feel — starting in Lucknow and across Uttar Pradesh.',
    extra: extra({
      alt: 'Community members sharing a bag of groceries'
    }),
    imagePath: '/images/grocery-aid-alley.jpg',
    sortOrder: 2
  },
  {
    pageKey: 'who-we-are',
    blockKey: 'vision',
    title: 'Our vision',
    body: 'We envision Uttar Pradesh communities where every neighbor can meet basic needs, learn with confidence, and earn with dignity — without waiting for help that never arrives.\n\nUtthan means uplift. Our vision is a network of local care strong enough that villages and city neighborhoods rise together, generation after generation.',
    extra: extra({
      alt: 'Teacher supporting children in a rural classroom'
    }),
    imagePath: '/images/rural-classroom-teaching.jpg',
    sortOrder: 3
  },
  {
    pageKey: 'who-we-are',
    blockKey: 'goal',
    title: 'Our goal',
    body: 'Expand trusted, community-led programs across more districts of Uttar Pradesh — food security, education support, livelihood skills, and neighborhood care.\n\nWe aim to grow with volunteers, members, and partners so every campaign is practical, accountable, and rooted in the people we serve.',
    extra: extra({
      alt: 'Women learning skills in a livelihood workshop'
    }),
    imagePath: '/images/women-sewing-workshop.jpg',
    sortOrder: 4
  },
  {
    pageKey: 'history',
    blockKey: 'hero',
    eyebrow: 'About Us',
    title: 'History',
    lede: 'How The Utthan Foundation began as neighbors helping neighbors across Uttar Pradesh.',
    sortOrder: 1
  },
  {
    pageKey: 'history',
    blockKey: 'story',
    title: 'Our story',
    body: 'The Utthan Foundation grew from neighbors sharing meals, school supplies, and winter kits with families who needed them most.\n\nToday we run campaigns with volunteers and local partners — expanding food security, education, livelihood, and community care programs across Uttar Pradesh.',
    extra: extra({
      alt: 'Community outreach in a village courtyard'
    }),
    imagePath: '/images/village-aid-notebooks.jpg',
    sortOrder: 2
  },
  {
    pageKey: 'history',
    blockKey: 'growth',
    title: 'How we grew',
    body: 'Placeholder history section. Early volunteers organized small drives block by block — kitchens, school kits, and winter warmth — then formalized as The Utthan Foundation to serve more communities across Uttar Pradesh.\n\nReplace this copy with real milestones, founding dates, and the people who shaped Utthan’s journey.',
    extra: extra({
      alt: 'Neighbors working together on a community drive'
    }),
    imagePath: '/images/community-street-cleanup.jpg',
    sortOrder: 3
  },
  {
    pageKey: 'leadership',
    blockKey: 'hero',
    eyebrow: 'About Us',
    title: 'Leadership',
    lede: 'Meet the leaders and advisory committee guiding The Utthan Foundation across Uttar Pradesh.',
    sortOrder: 1
  },
  {
    pageKey: 'leadership',
    blockKey: 'advisory-heading',
    title: 'Chief Advisory Committee',
    lede: 'Advisors guiding programs and ethics — placeholder profiles.',
    sortOrder: 2
  },
  {
    pageKey: 'leadership',
    blockKey: 'governing-heading',
    title: 'Governing Body',
    lede: 'Members of the governing body — placeholder profiles.',
    sortOrder: 3
  },
  {
    pageKey: 'team',
    blockKey: 'hero',
    eyebrow: 'About Us',
    title: 'Team',
    lede: 'Meet the board and volunteers coordinating The Utthan Foundation’s programs day to day.',
    sortOrder: 1
  },
  {
    pageKey: 'team',
    blockKey: 'core-heading',
    title: 'Core team',
    lede: 'Program coordinators and field leads — placeholder profiles.',
    sortOrder: 2
  },
  {
    pageKey: 'team',
    blockKey: 'volunteers-heading',
    title: 'Volunteers',
    lede: 'Field volunteers who keep campaigns moving — placeholder profiles.',
    sortOrder: 3
  },
  {
    pageKey: 'campaigns',
    blockKey: 'hero',
    eyebrow: 'Campaigns',
    title: 'Campaigns for community relief & care',
    lede: 'Browse ongoing, completed, and upcoming drives — winter relief, school kits, community kitchens, livelihood workshops, and more.',
    sortOrder: 1
  },
  {
    pageKey: 'blogs',
    blockKey: 'hero',
    eyebrow: 'Blogs & Media',
    title: 'Stories from The Utthan Foundation',
    lede: 'Field updates, campaign stories, and photo media from our work across Uttar Pradesh.',
    sortOrder: 1
  },
  {
    pageKey: 'donate',
    blockKey: 'hero',
    eyebrow: 'Donate',
    title: 'Donate to The Utthan Foundation',
    lede: 'Every gift helps neighbors rise. Support food security, education, livelihood, and community care across Uttar Pradesh.',
    extra: extra({
      campaignLede: 'Supporting: {title}. Every gift funds food, education, livelihood, and care across Uttar Pradesh.'
    }),
    sortOrder: 1
  },
  {
    pageKey: 'contact',
    blockKey: 'hero',
    eyebrow: 'Contact',
    title: 'Talk with Utthan',
    lede: 'Send a note, join the work, or find us across Uttar Pradesh.',
    imagePath: '/images/community-street-cleanup.jpg',
    sortOrder: 1
  },
  {
    pageKey: 'contact',
    blockKey: 'message-heading',
    title: 'Send a message',
    lede: 'Partnerships, press, or a simple hello — we read every note.',
    sortOrder: 2
  },
  {
    pageKey: 'contact',
    blockKey: 'join-heading',
    title: 'Join us',
    lede: 'Volunteer in the field or become a member.',
    sortOrder: 3
  },
  {
    pageKey: 'contact',
    blockKey: 'offices-heading',
    title: 'Our offices',
    lede: 'Three placeholder desks across Uttar Pradesh — replace with real addresses when ready.',
    sortOrder: 4
  },
  {
    pageKey: 'site',
    blockKey: 'footer',
    title: 'The Utthan Foundation',
    body: 'An NGO uniting neighbors across Uttar Pradesh for food security, education, livelihood, and community care.',
    sortOrder: 1
  }
];

function parseExtra(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function decorateBlock(block, mediaUrlFn) {
  if (!block) return null;
  const plain = block.get ? block.get({ plain: true }) : { ...block };
  const extraObj = parseExtra(plain.extra);
  delete extraObj.body2;
  return {
    ...plain,
    extra: extraObj,
    paragraphs: bodyParagraphs(plain.body),
    alt: extraObj.alt || '',
    imageUrl: plain.imageId && mediaUrlFn ? mediaUrlFn(plain.imageId) : ''
  };
}

function blockMap(blocks) {
  const map = {};
  (blocks || []).forEach((block) => {
    map[block.blockKey] = block;
  });
  return map;
}

module.exports = {
  PAGE_BLOCK_SEED,
  parseExtra,
  decorateBlock,
  blockMap
};

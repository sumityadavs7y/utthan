const {
  Campaign,
  Post,
  Gallery,
  TeamMember,
  Chairman,
  Testimonial,
  ImpactStat,
  Office,
  Partner,
  PageBlock,
  SiteConfig
} = require('../models');
const { slugify, parsePhotoList, parseTimeline } = require('./helpers');
const { parseExtra } = require('./pageBlocks');
const { mediaUrl } = require('./media');

const FIELD = {
  eyebrow: { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
  title: { name: 'title', label: 'Title', type: 'text' },
  lede: { name: 'lede', label: 'Intro text', type: 'textarea' },
  body: { name: 'body', label: 'Body (press Enter for a new paragraph)', type: 'textarea' },
  alt: { name: 'alt', label: 'Image description', type: 'text' },
  image: { name: 'image', label: 'Photo', type: 'file', mapsTo: 'imageId' },
  ctaPrimaryLabel: { name: 'ctaPrimaryLabel', label: 'First button label', type: 'text' },
  ctaPrimaryHref: { name: 'ctaPrimaryHref', label: 'First button link', type: 'text' },
  ctaSecondaryLabel: { name: 'ctaSecondaryLabel', label: 'Second button label', type: 'text' },
  ctaSecondaryHref: { name: 'ctaSecondaryHref', label: 'Second button link', type: 'text' },
  campaignLede: {
    name: 'campaignLede',
    label: 'Intro when a campaign is selected (use {title} for the campaign name)',
    type: 'textarea'
  }
};

const EXTRA_FIELDS = [
  FIELD.alt,
  FIELD.ctaPrimaryLabel,
  FIELD.ctaPrimaryHref,
  FIELD.ctaSecondaryLabel,
  FIELD.ctaSecondaryHref,
  FIELD.campaignLede
];

function pickFields(names) {
  return names.map((name) => FIELD[name]).filter(Boolean);
}

const PAGE_HERO = pickFields(['eyebrow', 'title', 'lede']);
const PAGE_HERO_IMAGE = pickFields(['eyebrow', 'title', 'lede', 'image']);
const HEADING = pickFields(['title', 'lede']);
const SPLIT = pickFields(['title', 'body', 'image', 'alt']);
const WITH_BUTTONS = pickFields([
  'eyebrow', 'title', 'lede', 'image',
  'ctaPrimaryLabel', 'ctaPrimaryHref', 'ctaSecondaryLabel', 'ctaSecondaryHref'
]);
const JOIN = pickFields([
  'title', 'lede', 'image', 'alt',
  'ctaPrimaryLabel', 'ctaPrimaryHref', 'ctaSecondaryLabel', 'ctaSecondaryHref'
]);

const PAGE_BLOCK_FIELDS = {
  'home:hero': PAGE_HERO_IMAGE,
  'home:campaigns-heading': HEADING,
  'home:what-we-do-heading': HEADING,
  'home:stories-heading': HEADING,
  'home:partners-heading': HEADING,
  'home:join': JOIN,
  'who-we-are:hero': PAGE_HERO,
  'who-we-are:mission': SPLIT,
  'who-we-are:vision': SPLIT,
  'who-we-are:goal': SPLIT,
  'history:hero': PAGE_HERO,
  'history:story': SPLIT,
  'history:growth': SPLIT,
  'leadership:hero': PAGE_HERO,
  'leadership:advisory-heading': HEADING,
  'leadership:governing-heading': HEADING,
  'team:hero': PAGE_HERO,
  'team:core-heading': HEADING,
  'team:volunteers-heading': HEADING,
  'campaigns:hero': PAGE_HERO,
  'blogs:hero': PAGE_HERO,
  'donate:hero': pickFields(['eyebrow', 'title', 'lede', 'campaignLede']),
  'contact:hero': PAGE_HERO_IMAGE,
  'contact:message-heading': HEADING,
  'contact:join-heading': HEADING,
  'contact:offices-heading': HEADING,
  'site:footer': pickFields(['title', 'body'])
};

const CATALOG = {
  campaign: {
    permission: 'campaigns.edit',
    label: 'Campaign',
    model: Campaign,
    deletable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug (optional)', type: 'text' },
      { name: 'category', label: 'Category', type: 'text', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'completed', label: 'Completed' },
          { value: 'upcoming', label: 'Upcoming' }
        ]
      },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'goalAmount', label: 'Goal amount (INR)', type: 'number' },
      { name: 'raisedAmount', label: 'Raised amount (INR)', type: 'number' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'timeline', label: 'Timeline', type: 'timeline' },
      { name: 'image', label: 'Cover photo', type: 'file', mapsTo: 'imageId' },
      { name: 'photos', label: 'Gallery photos', type: 'files', mapsTo: 'photoPaths' }
    ]
  },
  post: {
    permission: 'blogs.edit',
    label: 'Blog post',
    model: Post,
    deletable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'photos', label: 'Photos', type: 'files', mapsTo: 'photoPaths' }
    ]
  },
  gallery: {
    permission: 'media.edit',
    label: 'Media item',
    model: Gallery,
    deletable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'caption', label: 'Caption', type: 'text' },
      { name: 'mediaDate', label: 'Date', type: 'date' },
      { name: 'image', label: 'Photo', type: 'file', mapsTo: 'imageId', requiredOnCreate: true }
    ]
  },
  'team-member': {
    permissionByCategory: {
      advisory: 'about.leadership.edit',
      governing: 'about.leadership.edit',
      board: 'about.team.edit',
      volunteer: 'about.team.edit'
    },
    permission: 'about.team.edit',
    label: 'Person',
    model: TeamMember,
    deletable: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'designation', label: 'Designation', type: 'text' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'board', label: 'Core team' },
          { value: 'volunteer', label: 'Volunteer' },
          { value: 'advisory', label: 'Advisory' },
          { value: 'governing', label: 'Governing body' }
        ]
      },
      { name: 'bio', label: 'Bio', type: 'textarea' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'image', label: 'Photo', type: 'file', mapsTo: 'imageId' }
    ]
  },
  chairman: {
    permission: 'about.leadership.edit',
    label: 'Chairperson',
    model: Chairman,
    deletable: false,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      { name: 'photo', label: 'Photo', type: 'file', mapsTo: 'photoId' }
    ]
  },
  testimonial: {
    permission: 'stories.edit',
    label: 'Success story',
    model: Testimonial,
    deletable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'quote', label: 'Story', type: 'textarea', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'image', label: 'Photo', type: 'file', mapsTo: 'imageId' }
    ]
  },
  stat: {
    permission: 'stats.edit',
    label: 'Impact stat',
    model: ImpactStat,
    deletable: true,
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'number', required: true },
      { name: 'prefix', label: 'Prefix', type: 'text' },
      { name: 'suffix', label: 'Suffix', type: 'text' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' }
    ]
  },
  office: {
    permission: 'offices.edit',
    label: 'Office',
    model: Office,
    deletable: true,
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'textarea', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' }
    ]
  },
  partner: {
    permission: 'partners.edit',
    label: 'Partner',
    model: Partner,
    deletable: true,
    listEditable: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'showName', label: 'Show name', type: 'checkbox' },
      { name: 'logo', label: 'Logo', type: 'file', mapsTo: 'logoId' }
    ]
  },
  'home-feature': {
    permission: 'home.edit',
    label: 'Focus area',
    model: PageBlock,
    deletable: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'body', label: 'Description', type: 'textarea', required: true },
      { name: 'alt', label: 'Image alt text', type: 'text' },
      { name: 'image', label: 'Photo', type: 'file', mapsTo: 'imageId' }
    ]
  },
  'page-block': {
    permissionByPage: {
      home: 'home.edit',
      'who-we-are': 'about.who_we_are.edit',
      history: 'about.history.edit',
      leadership: 'about.leadership.edit',
      team: 'about.team.edit',
      campaigns: 'campaigns.edit',
      blogs: 'blogs.edit',
      donate: 'donate.edit',
      contact: 'contact.edit',
      site: 'settings.edit'
    },
    permission: 'home.edit',
    label: 'Page section',
    model: PageBlock,
    deletable: false,
    fields: HEADING
  },
  'site-config': {
    permission: 'settings.edit',
    label: 'Site settings',
    model: SiteConfig,
    deletable: false,
    fields: [
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'textarea', required: true },
      { name: 'facebookUrl', label: 'Facebook URL', type: 'text' },
      { name: 'instagramUrl', label: 'Instagram URL', type: 'text' },
      { name: 'twitterUrl', label: 'X / Twitter URL', type: 'text' },
      { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'text' },
      { name: 'youtubeUrl', label: 'YouTube URL', type: 'text' },
      { name: 'upiId', label: 'UPI ID', type: 'text' },
      { name: 'accountName', label: 'Account name', type: 'text' },
      { name: 'bankName', label: 'Bank name', type: 'text' },
      { name: 'accountNumber', label: 'Account number', type: 'text' },
      { name: 'ifsc', label: 'IFSC', type: 'text' },
      { name: 'donationLink', label: 'Donation link', type: 'text' },
      { name: 'memberFeeNote', label: 'Membership fee note', type: 'textarea' },
      { name: 'logo', label: 'Header logo', type: 'file', mapsTo: 'logoId' },
      { name: 'qr', label: 'Donation QR', type: 'file', mapsTo: 'qrImageId' }
    ]
  }
};

function getSpec(type) {
  return CATALOG[type] || null;
}

function fieldsFor(type, record) {
  const spec = getSpec(type);
  if (!spec) return [];
  if (type === 'page-block' && record) {
    const key = `${record.pageKey}:${record.blockKey}`;
    if (PAGE_BLOCK_FIELDS[key]) return PAGE_BLOCK_FIELDS[key];
    if (record.blockKey && String(record.blockKey).startsWith('what-we-do-') && record.blockKey !== 'what-we-do-heading') {
      return CATALOG['home-feature'].fields;
    }
  }
  return spec.fields;
}

function permissionFor(spec, record, extra = {}) {
  if (spec.permissionByCategory) {
    const category = (record && record.category) || extra.category;
    if (category && spec.permissionByCategory[category]) {
      return spec.permissionByCategory[category];
    }
  }
  if (spec.permissionByPage) {
    const pageKey = (record && record.pageKey) || extra.pageKey;
    if (pageKey && spec.permissionByPage[pageKey]) {
      return spec.permissionByPage[pageKey];
    }
  }
  return spec.permission;
}

function serializeRecord(type, record) {
  if (!record) return {};
  const plain = record.get ? record.get({ plain: true }) : { ...record };
  const values = { ...plain };
  delete values.data;

  if (type === 'campaign' || type === 'post') {
    if (type === 'campaign') {
      values.imagePreview = mediaUrl(plain.imageId);
      values.timelineItems = parseTimeline(plain.timeline).map((item) => {
        const ids = parsePhotoList(item.photoIds).map(Number).filter(Boolean);
        return {
          date: item.date || '',
          title: item.title || '',
          detail: item.detail || '',
          photosItems: ids.map((id) => ({ id, url: mediaUrl(id) }))
        };
      });
      delete values.timeline;
    }
    let ids = parsePhotoList(plain.photoPaths).map(Number).filter(Boolean);
    if (type === 'post' && !ids.length && plain.imageId) ids = [Number(plain.imageId)];
    values.photosItems = ids.map((id) => ({ id, url: mediaUrl(id) }));
    values.photosPreview = values.photosItems.map((item) => item.url);
    if (type === 'post' && values.photosPreview[0]) values.imagePreview = values.photosPreview[0];
  }

  if (type === 'page-block' || type === 'home-feature') {
    const extraObj = parseExtra(plain.extra);
    EXTRA_FIELDS.forEach((field) => {
      values[field.name] = extraObj[field.name] || '';
    });
    values.imagePreview = mediaUrl(plain.imageId);
  }

  if (plain.imageId) values.imagePreview = values.imagePreview || mediaUrl(plain.imageId);
  if (plain.photoId) values.photoPreview = mediaUrl(plain.photoId);
  if (plain.logoId) values.logoPreview = mediaUrl(plain.logoId);
  if (plain.qrImageId) values.qrPreview = mediaUrl(plain.qrImageId);
  if (typeof plain.showName === 'boolean') values.showName = plain.showName;

  return values;
}

function applySlug(values) {
  if (values.title && !String(values.slug || '').trim()) {
    values.slug = slugify(values.title);
  } else if (values.slug) {
    values.slug = slugify(values.slug);
  }
}

module.exports = {
  CATALOG,
  EXTRA_FIELDS,
  getSpec,
  fieldsFor,
  permissionFor,
  serializeRecord,
  applySlug
};

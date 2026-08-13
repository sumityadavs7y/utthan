const { envConfig } = require('../config');

function isDevEnvMode() {
  return envConfig.envMode === 'development';
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatCurrencyINR(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function campaignProgress(raised, goal) {
  const g = Number(goal) || 0;
  const r = Number(raised) || 0;
  if (g <= 0) return 0;
  return Math.min(100, Math.round((r / g) * 100));
}

function parseTimeline(timeline) {
  if (!timeline) return [];
  if (Array.isArray(timeline)) return timeline;
  try {
    const parsed = JSON.parse(timeline);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function bodyParagraphs(text) {
  return String(text || '')
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parsePhotoList(photos) {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function photoUrls(photos, mediaUrlFn) {
  return parsePhotoList(photos).map((item) => {
    if (typeof item === 'number' || /^\d+$/.test(String(item))) {
      return mediaUrlFn ? mediaUrlFn(item) : `/media/${item}`;
    }
    return String(item);
  });
}

function formatCampaignDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/** Status-based campaign date range for cards and detail pages. */
function campaignDateLabel(campaign) {
  const start = formatCampaignDate(campaign.startDate);
  const end = formatCampaignDate(campaign.endDate);
  const status = campaign.status;

  if (status === 'ongoing') {
    return start ? `${start} – Present` : null;
  }
  if (status === 'completed') {
    if (start && end) return `${start} – ${end}`;
    return start || end || null;
  }
  if (status === 'upcoming') {
    return start ? `Starts ${start}` : null;
  }
  return null;
}

module.exports = {
  isDevEnvMode,
  slugify,
  formatCurrencyINR,
  campaignProgress,
  parseTimeline,
  bodyParagraphs,
  parsePhotoList,
  photoUrls,
  formatCampaignDate,
  campaignDateLabel
};

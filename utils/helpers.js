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

module.exports = {
  isDevEnvMode,
  slugify,
  formatCurrencyINR,
  campaignProgress,
  parseTimeline,
  parsePhotoList
};

const { envConfig } = require('../config');

const IST_TIMEZONE = 'Asia/Kolkata';
const IST_LOCALE = 'en-IN';

function isDevEnvMode() {
  return envConfig.envMode === 'development';
}

function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTimeIst(value) {
  const date = toValidDate(value);
  if (!date) return '';
  return date.toLocaleString(IST_LOCALE, { timeZone: IST_TIMEZONE });
}

function formatDateIst(value) {
  const date = toValidDate(value);
  if (!date) return '';
  return date.toLocaleDateString(IST_LOCALE, { timeZone: IST_TIMEZONE });
}

function formatDayIst(value) {
  const date = toValidDate(value) || new Date();
  return date.toLocaleString(IST_LOCALE, {
    timeZone: IST_TIMEZONE,
    day: '2-digit'
  });
}

function formatMonthIst(value) {
  const date = toValidDate(value) || new Date();
  return date.toLocaleString('en-US', {
    timeZone: IST_TIMEZONE,
    month: 'long'
  });
}

/** Parse a datetime-local value as IST and return a Date (UTC instant). */
function parseIstDateTimeInput(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return toValidDate(raw);
  }

  const [, year, month, day, hour, minute, second = '00'] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a Date for <input type="datetime-local"> in IST. */
function toDatetimeLocalIst(value) {
  const date = toValidDate(value);
  if (!date) return '';

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  const hour = parts.hour === '24' ? '00' : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
}

module.exports = {
  isDevEnvMode,
  IST_TIMEZONE,
  formatDateTimeIst,
  formatDateIst,
  formatDayIst,
  formatMonthIst,
  parseIstDateTimeInput,
  toDatetimeLocalIst
};

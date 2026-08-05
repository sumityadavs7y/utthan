const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function rateLimit({ windowMs = 60 * 1000, max = 8, message = 'Too many requests. Please try again shortly.' } = {}) {
  return (req, res, next) => {
    const key = `${getClientIp(req)}:${req.path}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count > max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      if (req.path.startsWith('/api/')) {
        return res.status(429).json({ status: 0, msg: message });
      }
      req.flash('error', message);
      return res.redirect('back');
    }

    return next();
  };
}

// Periodic cleanup so memory does not grow forever
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref();

module.exports = {
  rateLimit
};

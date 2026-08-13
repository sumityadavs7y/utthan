const crypto = require('crypto');
const { User, Role, Permission } = require('../models');
const { userCan } = require('../utils/permissions');
const { mediaUrl } = require('../utils/media');

function wantsJson(req) {
  return (
    req.xhr ||
    req.path.startsWith('/cms') ||
    (req.headers.accept || '').includes('application/json')
  );
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  return req.session.csrfToken;
}

function verifyCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.body && req.body._csrf
    ? req.body._csrf
    : req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    if (wantsJson(req)) {
      return res.status(403).json({ ok: false, error: 'Invalid security token. Refresh and try again.' });
    }
    req.flash('error', 'Invalid security token. Please try again.');
    return res.redirect('back');
  }
  return next();
}

async function loadCurrentUser(req, res, next) {
  try {
    const csrfToken = ensureCsrfToken(req);
    res.locals.csrfToken = csrfToken;
    res.locals.csrfField = `<input type="hidden" name="_csrf" value="${csrfToken}">`;
    res.locals.mediaUrl = mediaUrl;
    res.locals.currentUser = null;
    res.locals.can = () => false;

    if (!req.session.userId) return next();

    const user = await User.findByPk(req.session.userId, {
      include: [{
        model: Role,
        include: [Permission]
      }]
    });

    if (!user || !user.isActive) {
      delete req.session.userId;
      return next();
    }

    const plain = user.get({ plain: true });
    delete plain.passwordHash;
    req.currentUser = plain;
    res.locals.currentUser = plain;
    res.locals.can = (key) => userCan(plain, key);
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireAuth(req, res, next) {
  if (req.currentUser) return next();
  if (wantsJson(req)) {
    return res.status(401).json({ ok: false, error: 'Please log in.' });
  }
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Please log in to continue.');
  return res.redirect('/login');
}

function requirePermission(key) {
  return (req, res, next) => {
    if (!req.currentUser) {
      if (wantsJson(req)) {
        return res.status(401).json({ ok: false, error: 'Please log in.' });
      }
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'Please log in to continue.');
      return res.redirect('/login');
    }
    if (!userCan(req.currentUser, key)) {
      if (wantsJson(req)) {
        return res.status(403).json({ ok: false, error: 'You do not have permission to do that.' });
      }
      req.flash('error', 'You do not have permission to do that.');
      return res.redirect('/');
    }
    return next();
  };
}

module.exports = {
  loadCurrentUser,
  requireAuth,
  requirePermission,
  verifyCsrf,
  wantsJson
};

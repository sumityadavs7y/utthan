const { redirectWithFlash } = require('../utils/redirect');

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return redirectWithFlash(req, res, '/login', 'error', 'Please log in to continue.');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return redirectWithFlash(req, res, '/login', 'error', 'Please log in to continue.');
  }

  if (!res.locals.currentUser || res.locals.currentUser.role !== 'admin') {
    return redirectWithFlash(req, res, '/account', 'error', 'You do not have permission to access that page.');
  }

  return next();
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/account');
  }
  return next();
}

function canManagePost(user, post) {
  if (!user || !post) return false;
  return user.id === post.userId || user.role === 'admin';
}

module.exports = {
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated,
  canManagePost
};

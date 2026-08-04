function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }

  if (!res.locals.currentUser || res.locals.currentUser.role !== 'admin') {
    req.flash('error', 'You do not have permission to access that page.');
    return res.redirect('/account');
  }

  return next();
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/account');
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated
};

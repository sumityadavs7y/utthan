function redirectWithFlash(req, res, url, type, message) {
  if (type && message) {
    req.flash(type, message);
  }

  // Persist session before redirect so flash/login state survives async stores
  // (e.g. connect-session-sequelize + Postgres in production).
  return req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
    }
    return res.redirect(url);
  });
}

module.exports = {
  redirectWithFlash
};

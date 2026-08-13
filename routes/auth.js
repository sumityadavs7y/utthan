const bcrypt = require('bcryptjs');
const { User, Role, Permission } = require('../models');
const { rateLimit } = require('../middleware/rateLimit');
const { verifyCsrf } = require('../middleware/auth');
const { buildPageSeo } = require('../utils/seo');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: 'Too many login attempts. Please try again shortly.'
});

function createAuthRouter(express) {
  const router = express.Router();

  router.get('/login', (req, res) => {
    if (req.currentUser) return res.redirect('/');
    return res.render('login', {
      title: 'Login',
      ...buildPageSeo({
        seoTitle: 'Login · The Utthan Foundation',
        description: 'Sign in to edit The Utthan Foundation website.',
        path: '/login',
        noindex: true
      }),
      jsonLd: []
    });
  });

  router.post('/login', loginLimiter, verifyCsrf, async (req, res, next) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');

      if (!email || !password) {
        req.flash('error', 'Enter your email and password.');
        return res.redirect('/login');
      }

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, include: [Permission] }]
      });

      if (!user || !user.isActive) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      req.session.userId = user.id;
      const dest = req.session.returnTo || '/';
      delete req.session.returnTo;
      req.flash('success', `Welcome back, ${user.name}.`);
      return res.redirect(dest);
    } catch (err) {
      return next(err);
    }
  });

  router.post('/logout', verifyCsrf, (req, res) => {
    delete req.session.userId;
    req.flash('success', 'You have been logged out.');
    return res.redirect('/');
  });

  return router;
}

module.exports = { createAuthRouter };

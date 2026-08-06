const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const {
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated
} = require('../middleware/auth');
const { redirectWithFlash } = require('../utils/redirect');

const router = express.Router();

const renderPage = (res, view, locals) => {
  res.render(view, {
    skin: 'skin-1',
    loaderStyle: 'page-1',
    isHome: false,
    extraCss: [],
    extraJs: [],
    ...locals
  });
};

router.get('/login', redirectIfAuthenticated, (req, res) => {
  renderPage(res, 'login', {
    title: 'Login - Utthan Foundation',
    currentPage: 'login'
  });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return redirectWithFlash(req, res, '/login', 'error', 'Email and password are required.');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return redirectWithFlash(req, res, '/login', 'error', 'Invalid email or password.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return redirectWithFlash(req, res, '/login', 'error', 'Invalid email or password.');
    }

    req.session.userId = user.id;
    return redirectWithFlash(req, res, '/account', 'success', `Welcome back, ${user.name}.`);
  } catch (error) {
    console.error('Login error:', error);
    return redirectWithFlash(req, res, '/login', 'error', 'Unable to log in. Please try again.');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      req.flash('error', 'Unable to log out. Please try again.');
      return res.redirect('/account');
    }
    res.clearCookie('connect.sid');
    return res.redirect('/login');
  });
});

router.get('/account', requireAuth, (req, res) => {
  renderPage(res, 'account', {
    title: 'My Account - Utthan Foundation',
    currentPage: 'account'
  });
});

router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    renderPage(res, 'admin-users', {
      title: 'Manage Users - Utthan Foundation',
      currentPage: 'admin-users',
      users
    });
  } catch (error) {
    console.error('List users error:', error);
    req.flash('error', 'Unable to load users.');
    return res.redirect('/account');
  }
});

router.post('/admin/users', requireAdmin, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const role = req.body.role === 'admin' ? 'admin' : 'user';

    if (!name || !email || !password) {
      req.flash('error', 'Name, email, and password are required.');
      return res.redirect('/admin/users');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/admin/users');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      req.flash('error', 'A user with that email already exists.');
      return res.redirect('/admin/users');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash, role });

    req.flash('success', `User ${name} created successfully.`);
    return res.redirect('/admin/users');
  } catch (error) {
    console.error('Create user error:', error);
    req.flash('error', 'Unable to create user. Please try again.');
    return res.redirect('/admin/users');
  }
});

router.post('/admin/users/:id/password', requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const password = req.body.password || '';

    if (!userId || Number.isNaN(userId)) {
      req.flash('error', 'Invalid user.');
      return res.redirect('/admin/users');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/admin/users');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/admin/users');
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();

    req.flash('success', `Password updated for ${user.name}.`);
    return res.redirect('/admin/users');
  } catch (error) {
    console.error('Change password error:', error);
    req.flash('error', 'Unable to change password. Please try again.');
    return res.redirect('/admin/users');
  }
});

router.post('/admin/users/:id/delete', requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      req.flash('error', 'Invalid user.');
      return res.redirect('/admin/users');
    }

    if (userId === req.session.userId) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/admin/users');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/admin/users');
    }

    const name = user.name;
    await user.destroy();

    req.flash('success', `User ${name} deleted.`);
    return res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    req.flash('error', 'Unable to delete user. Please try again.');
    return res.redirect('/admin/users');
  }
});

module.exports = router;

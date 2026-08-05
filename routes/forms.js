const express = require('express');
const {
  ContactMessage,
  VolunteerApplication,
  NewsletterSubscriber
} = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const formLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: 'Too many submissions. Please wait a minute and try again.'
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function jsonOk(res, msg) {
  return res.json({ status: 1, msg });
}

function jsonErr(res, msg, statusCode = 400) {
  return res.status(statusCode).json({ status: 0, msg });
}

function clean(value, max = 500) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (!text) return '';
  return text.slice(0, max);
}

function cleanMultiline(value, max = 5000) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.slice(0, max);
}

function isValidEmail(email) {
  return EMAIL_RE.test(email) && email.length <= 200;
}

router.post('/api/contact', formLimit, async (req, res) => {
  try {
    const firstName = clean(req.body.dzFirstName || req.body.dzName, 100);
    const lastName = clean(req.body.dzLastName, 100);
    const email = clean(req.body.dzEmail, 200).toLowerCase();
    const phone = clean(req.body.dzPhoneNumber, 40);
    const message = cleanMultiline(req.body.dzMessage, 5000);
    const source = clean(req.body.dzSource || 'contact', 50) || 'contact';

    if (!firstName || !email || !message) {
      return jsonErr(res, 'Please fill in your name, email, and message.');
    }
    if (!isValidEmail(email)) {
      return jsonErr(res, 'Please enter a valid email address.');
    }

    await ContactMessage.create({
      firstName,
      lastName: lastName || null,
      email,
      phone: phone || null,
      message,
      source
    });

    return jsonOk(res, 'Thank you! Your message has been sent.');
  } catch (error) {
    console.error('Contact form error:', error);
    return jsonErr(res, 'Unable to send your message. Please try again.', 500);
  }
});

router.post('/api/volunteer', formLimit, async (req, res) => {
  try {
    const name = clean(req.body.dzName || [req.body.dzFirstName, req.body.dzLastName].filter(Boolean).join(' '), 200);
    const email = clean(req.body.dzEmail, 200).toLowerCase();
    const phone = clean(req.body.dzPhoneNumber, 40);
    const company = clean(
      req.body.dzCompany || req.body['dzOther[company_Name]'] || (req.body.dzOther && req.body.dzOther.company_Name),
      200
    );
    const message = cleanMultiline(req.body.dzMessage, 5000);

    if (!name || !email || !message) {
      return jsonErr(res, 'Please fill in your name, email, and message.');
    }
    if (!isValidEmail(email)) {
      return jsonErr(res, 'Please enter a valid email address.');
    }

    await VolunteerApplication.create({
      name,
      email,
      phone: phone || null,
      company: company || null,
      message
    });

    return jsonOk(res, 'Thank you for volunteering! We will be in touch soon.');
  } catch (error) {
    console.error('Volunteer form error:', error);
    return jsonErr(res, 'Unable to submit your application. Please try again.', 500);
  }
});

router.post('/api/newsletter', formLimit, async (req, res) => {
  try {
    const email = clean(req.body.dzEmail, 200).toLowerCase();
    const source = clean(req.body.dzSource || 'website', 50) || 'website';

    if (!email) {
      return jsonErr(res, 'Please enter your email address.');
    }
    if (!isValidEmail(email)) {
      return jsonErr(res, 'Please enter a valid email address.');
    }

    const existing = await NewsletterSubscriber.findOne({ where: { email } });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.source = source;
        await existing.save();
      }
      return jsonOk(res, "You're already subscribed. Thank you!");
    }

    await NewsletterSubscriber.create({ email, source, isActive: true });
    return jsonOk(res, 'Subscribed! Thanks for joining our newsletter.');
  } catch (error) {
    console.error('Newsletter form error:', error);
    return jsonErr(res, 'Unable to subscribe right now. Please try again.', 500);
  }
});

router.get('/admin/inbox', requireAdmin, async (req, res) => {
  try {
    const [contacts, volunteers, subscribers] = await Promise.all([
      ContactMessage.findAll({ order: [['id', 'DESC']], limit: 100 }),
      VolunteerApplication.findAll({ order: [['id', 'DESC']], limit: 100 }),
      NewsletterSubscriber.findAll({
        where: { isActive: true },
        order: [['id', 'DESC']],
        limit: 200
      })
    ]);

    renderPage(res, 'admin-inbox', {
      title: 'Inbox - Utthan Foundation',
      currentPage: 'admin-inbox',
      contacts,
      volunteers,
      subscribers
    });
  } catch (error) {
    console.error('Admin inbox load error:', error);
    req.flash('error', 'Unable to load inbox.');
    return res.redirect('/account');
  }
});

router.post('/admin/inbox/contacts/:id/read', requireAdmin, async (req, res) => {
  try {
    const item = await ContactMessage.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Message not found.');
      return res.redirect('/admin/inbox');
    }
    item.isRead = true;
    await item.save();
    req.flash('success', 'Marked as read.');
    return res.redirect('/admin/inbox#contacts');
  } catch (error) {
    console.error('Mark contact read error:', error);
    req.flash('error', 'Unable to update message.');
    return res.redirect('/admin/inbox');
  }
});

router.post('/admin/inbox/contacts/:id/delete', requireAdmin, async (req, res) => {
  try {
    const item = await ContactMessage.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Message not found.');
      return res.redirect('/admin/inbox');
    }
    await item.destroy();
    req.flash('success', 'Contact message deleted.');
    return res.redirect('/admin/inbox#contacts');
  } catch (error) {
    console.error('Delete contact error:', error);
    req.flash('error', 'Unable to delete message.');
    return res.redirect('/admin/inbox');
  }
});

router.post('/admin/inbox/volunteers/:id/read', requireAdmin, async (req, res) => {
  try {
    const item = await VolunteerApplication.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Application not found.');
      return res.redirect('/admin/inbox');
    }
    item.isRead = true;
    await item.save();
    req.flash('success', 'Marked as read.');
    return res.redirect('/admin/inbox#volunteers');
  } catch (error) {
    console.error('Mark volunteer read error:', error);
    req.flash('error', 'Unable to update application.');
    return res.redirect('/admin/inbox');
  }
});

router.post('/admin/inbox/volunteers/:id/delete', requireAdmin, async (req, res) => {
  try {
    const item = await VolunteerApplication.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Application not found.');
      return res.redirect('/admin/inbox');
    }
    await item.destroy();
    req.flash('success', 'Volunteer application deleted.');
    return res.redirect('/admin/inbox#volunteers');
  } catch (error) {
    console.error('Delete volunteer error:', error);
    req.flash('error', 'Unable to delete application.');
    return res.redirect('/admin/inbox');
  }
});

router.post('/admin/inbox/subscribers/:id/delete', requireAdmin, async (req, res) => {
  try {
    const item = await NewsletterSubscriber.findByPk(Number(req.params.id));
    if (!item) {
      req.flash('error', 'Subscriber not found.');
      return res.redirect('/admin/inbox');
    }
    await item.destroy();
    req.flash('success', 'Subscriber removed.');
    return res.redirect('/admin/inbox#subscribers');
  } catch (error) {
    console.error('Delete subscriber error:', error);
    req.flash('error', 'Unable to remove subscriber.');
    return res.redirect('/admin/inbox');
  }
});

module.exports = router;

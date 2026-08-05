const express = require('express');
const path = require('path');
const fs = require('fs');
const { Chairman, TeamMember } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { teamUpload, ensureTeamUploadDir } = require('../middleware/upload');

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

function removeUploadedFile(imagePath) {
  if (!imagePath || !String(imagePath).startsWith('/uploads/team/')) return;
  const absolute = path.join(__dirname, '../public', imagePath.replace(/^\//, ''));
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
}

function cleanupFile(file) {
  if (file) removeUploadedFile(`/uploads/team/${file.filename}`);
}

function cleanupFiles(files) {
  if (!files) return;
  Object.values(files).forEach((list) => {
    (list || []).forEach((file) => cleanupFile(file));
  });
}

function handleChairmanUpload(req, res, next) {
  teamUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/team');
    }
    return next();
  });
}

function handleMemberUpload(req, res, next) {
  teamUpload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/team');
    }
    return next();
  });
}

function firstFile(files, field) {
  return files && files[field] && files[field][0] ? files[field][0] : null;
}

async function loadTeamPageData() {
  const [chairman, boardMembers, volunteers] = await Promise.all([
    Chairman.findOne({ order: [['id', 'ASC']] }),
    TeamMember.findAll({
      where: { category: 'board' },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    }),
    TeamMember.findAll({
      where: { category: 'volunteer' },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    })
  ]);

  return { chairman, boardMembers, volunteers };
}

router.get('/team', async (req, res) => {
  try {
    ensureTeamUploadDir();
    const data = await loadTeamPageData();

    renderPage(res, 'team', {
      title: 'Our Team - Utthan Foundation',
      currentPage: 'team',
      ...data,
      extraCss: ['/vendor/magnific-popup/magnific-popup.min.css'],
      extraJs: ['/vendor/magnific-popup/magnific-popup.js']
    });
  } catch (error) {
    console.error('Team page error:', error);
    req.flash('error', 'Unable to load the team page.');
    renderPage(res, 'team', {
      title: 'Our Team - Utthan Foundation',
      currentPage: 'team',
      chairman: null,
      boardMembers: [],
      volunteers: [],
      extraCss: ['/vendor/magnific-popup/magnific-popup.min.css'],
      extraJs: ['/vendor/magnific-popup/magnific-popup.js']
    });
  }
});

function safeReturnTo(value, fallback = '/team') {
  const allowed = ['/team', '/about-us'];
  return allowed.includes(value) ? value : fallback;
}

router.post('/team/chairman', requireAdmin, handleChairmanUpload, async (req, res) => {
  const returnTo = safeReturnTo(req.body.returnTo);
  try {
    const name = (req.body.name || '').trim();
    const role = (req.body.role || '').trim() || null;
    const message = (req.body.message || '').trim();
    const photoFile = firstFile(req.files, 'photo');
    const signatureFile = firstFile(req.files, 'signature');

    if (!name || !message) {
      cleanupFiles(req.files);
      req.flash('error', 'Chairman name and message are required.');
      return res.redirect(returnTo);
    }

    let chairman = await Chairman.findOne({ order: [['id', 'ASC']] });

    if (!chairman) {
      if (!photoFile) {
        cleanupFiles(req.files);
        req.flash('error', 'Chairman photo is required.');
        return res.redirect(returnTo);
      }

      await Chairman.create({
        name,
        role,
        message,
        photoPath: `/uploads/team/${photoFile.filename}`,
        signaturePath: signatureFile ? `/uploads/team/${signatureFile.filename}` : null
      });
    } else {
      chairman.name = name;
      chairman.role = role;
      chairman.message = message;

      if (photoFile) {
        removeUploadedFile(chairman.photoPath);
        chairman.photoPath = `/uploads/team/${photoFile.filename}`;
      }

      if (signatureFile) {
        removeUploadedFile(chairman.signaturePath);
        chairman.signaturePath = `/uploads/team/${signatureFile.filename}`;
      }

      await chairman.save();
    }

    req.flash('success', 'Chairman section updated.');
    return res.redirect(returnTo);
  } catch (error) {
    console.error('Chairman update error:', error);
    cleanupFiles(req.files);
    req.flash('error', 'Unable to update chairman section.');
    return res.redirect(returnTo);
  }
});

router.post('/team/members', requireAdmin, handleMemberUpload, async (req, res) => {
  try {
    const category = req.body.category === 'volunteer' ? 'volunteer' : 'board';
    const name = (req.body.name || '').trim();
    const designation = (req.body.designation || '').trim() || null;
    const sortOrder = Number(req.body.sortOrder) || 0;

    if (!name) {
      cleanupFile(req.file);
      req.flash('error', 'Name is required.');
      return res.redirect('/team');
    }

    if (category === 'board' && !designation) {
      cleanupFile(req.file);
      req.flash('error', 'Designation is required for board members.');
      return res.redirect('/team');
    }

    if (!req.file) {
      req.flash('error', 'Photo is required.');
      return res.redirect('/team');
    }

    await TeamMember.create({
      name,
      designation: category === 'board' ? designation : null,
      imagePath: `/uploads/team/${req.file.filename}`,
      category,
      sortOrder
    });

    req.flash('success', category === 'board' ? 'Board member added.' : 'Volunteer added.');
    return res.redirect('/team');
  } catch (error) {
    console.error('Team member create error:', error);
    cleanupFile(req.file);
    req.flash('error', 'Unable to add team member.');
    return res.redirect('/team');
  }
});

router.post('/team/members/:id/edit', requireAdmin, handleMemberUpload, async (req, res) => {
  try {
    const memberId = Number(req.params.id);
    if (!memberId || Number.isNaN(memberId)) {
      cleanupFile(req.file);
      req.flash('error', 'Invalid team member.');
      return res.redirect('/team');
    }

    const member = await TeamMember.findByPk(memberId);
    if (!member) {
      cleanupFile(req.file);
      req.flash('error', 'Team member not found.');
      return res.redirect('/team');
    }

    const name = (req.body.name || '').trim();
    const designation = (req.body.designation || '').trim() || null;
    const sortOrder = Number(req.body.sortOrder);
    const category = member.category;

    if (!name) {
      cleanupFile(req.file);
      req.flash('error', 'Name is required.');
      return res.redirect('/team');
    }

    if (category === 'board' && !designation) {
      cleanupFile(req.file);
      req.flash('error', 'Designation is required for board members.');
      return res.redirect('/team');
    }

    member.name = name;
    member.designation = category === 'board' ? designation : null;
    if (!Number.isNaN(sortOrder)) {
      member.sortOrder = sortOrder;
    }

    if (req.file) {
      removeUploadedFile(member.imagePath);
      member.imagePath = `/uploads/team/${req.file.filename}`;
    }

    await member.save();
    req.flash('success', 'Team member updated.');
    return res.redirect('/team');
  } catch (error) {
    console.error('Team member edit error:', error);
    cleanupFile(req.file);
    req.flash('error', 'Unable to update team member.');
    return res.redirect('/team');
  }
});

router.post('/team/members/:id/delete', requireAdmin, async (req, res) => {
  try {
    const memberId = Number(req.params.id);
    if (!memberId || Number.isNaN(memberId)) {
      req.flash('error', 'Invalid team member.');
      return res.redirect('/team');
    }

    const member = await TeamMember.findByPk(memberId);
    if (!member) {
      req.flash('error', 'Team member not found.');
      return res.redirect('/team');
    }

    removeUploadedFile(member.imagePath);
    await member.destroy();

    req.flash('success', 'Team member deleted.');
    return res.redirect('/team');
  } catch (error) {
    console.error('Team member delete error:', error);
    req.flash('error', 'Unable to delete team member.');
    return res.redirect('/team');
  }
});

module.exports = router;

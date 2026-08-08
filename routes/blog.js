const express = require('express');
const { Post, User } = require('../models');
const { requireAuth, canManagePost } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { saveUploadedFiles, deleteMediaByUrls } = require('../utils/media');
const { parseIstDateTimeInput, formatDateIst } = require('../utils/helpers');

const router = express.Router();
const MAX_IMAGES = 10;
const CATEGORIES = ['Education', 'Medical', 'Rescue', 'Donations', 'Charity', 'Health'];
const PLACEHOLDER_IMAGE = '/images/blog/blog-grid/pic1.jpg';

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

function normalizeCategory(value) {
  const raw = (value || '').trim();
  const match = CATEGORIES.find((item) => item.toLowerCase() === raw.toLowerCase());
  return match || 'Charity';
}

function parseImages(imagePath) {
  if (!imagePath) return [];
  if (Array.isArray(imagePath)) return imagePath.filter(Boolean);
  const raw = String(imagePath).trim();
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }
  return [raw];
}

function serializeImages(paths) {
  if (!paths || !paths.length) return null;
  return JSON.stringify(paths);
}

function truncateText(text, max = 140) {
  const value = String(text || '').trim();
  if (!value) return '';
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function isAdminUser(user) {
  return Boolean(user && user.role === 'admin');
}

function serializePost(post, currentUser) {
  const author = post.author || {};
  const showAuthor = Boolean(currentUser);
  const category = post.category || 'Charity';
  const images = parseImages(post.imagePath);
  const title = String(post.title || '').trim() || truncateText(post.content, 72) || 'Untitled Post';

  return {
    id: post.id,
    title,
    content: post.content,
    excerpt: truncateText(post.content, 140),
    category,
    filterClass: String(category).replace(/\s+/g, ''),
    images,
    coverImage: images[0] || PLACEHOLDER_IMAGE,
    createdAt: post.createdAt,
    dateDisplay: formatDateIst(post.createdAt),
    author: showAuthor
      ? {
          id: author.id,
          name: author.name || 'Unknown'
        }
      : null,
    canManage: canManagePost(currentUser, post)
  };
}

async function loadAuthorOptions() {
  return User.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC'], ['id', 'ASC']]
  });
}

async function resolveAuthorUserId(req, currentUser) {
  if (!isAdminUser(currentUser)) {
    return currentUser.id;
  }

  const requestedId = Number(req.body.userId);
  if (!requestedId || Number.isNaN(requestedId)) {
    return currentUser.id;
  }

  const author = await User.findByPk(requestedId, { attributes: ['id'] });
  return author ? author.id : currentUser.id;
}

function resolveCreatedAt(req) {
  const raw = (req.body.createdAt || '').trim();
  if (!raw) return null;

  const parsed = parseIstDateTimeInput(raw);
  if (!parsed) {
    const error = new Error('Invalid post date.');
    error.status = 400;
    throw error;
  }
  return parsed;
}

function resolveTitle(req) {
  const title = (req.body.title || '').trim();
  if (!title) {
    const error = new Error('Post title is required.');
    error.status = 400;
    throw error;
  }
  return title.slice(0, 255);
}

const blogPageAssets = {
  extraCss: [
    '/vendor/magnific-popup/magnific-popup.min.css',
    '/vendor/bootstrap-select/css/bootstrap-select.min.css'
  ],
  extraJs: [
    '/vendor/bootstrap-select/js/bootstrap-select.min.js',
    '/vendor/magnific-popup/magnific-popup.js',
    '/vendor/masonry/masonry-4.2.2.js',
    '/vendor/masonry/isotope.pkgd.min.js',
    '/vendor/imagesloaded/imagesloaded.js'
  ]
};

function handleUpload(req, res, next) {
  upload.array('images', MAX_IMAGES)(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'Image upload failed.');
      return res.redirect('/blog');
    }
    return next();
  });
}

router.get('/blog', async (req, res) => {
  try {
    const currentUser = res.locals.currentUser;
    const [rows, authors] = await Promise.all([
      Post.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC'], ['id', 'DESC']]
      }),
      isAdminUser(currentUser) ? loadAuthorOptions() : Promise.resolve([])
    ]);

    const posts = rows.map((post) => serializePost(post, currentUser));
    const categories = [...new Set(posts.map((item) => item.category))].sort();

    renderPage(res, 'blog-list', {
      title: 'Blogs & Media - Utthan Foundation',
      currentPage: 'blog',
      posts,
      authors,
      categories,
      categoryOptions: CATEGORIES,
      ...blogPageAssets
    });
  } catch (error) {
    console.error('Blog feed error:', error);
    req.flash('error', 'Unable to load the blog feed.');
    renderPage(res, 'blog-list', {
      title: 'Blogs & Media - Utthan Foundation',
      currentPage: 'blog',
      posts: [],
      authors: [],
      categories: [],
      categoryOptions: CATEGORIES,
      ...blogPageAssets
    });
  }
});

router.post('/blog', requireAuth, handleUpload, async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) {
      req.flash('error', 'Post description is required.');
      return res.redirect('/blog');
    }

    const title = resolveTitle(req);
    const currentUser = res.locals.currentUser;
    const userId = await resolveAuthorUserId(req, currentUser);
    const createdAt = resolveCreatedAt(req);
    const category = normalizeCategory(req.body.category);
    const imageUrls = await saveUploadedFiles(req.files);

    const payload = {
      userId,
      title,
      content,
      category,
      imagePath: serializeImages(imageUrls)
    };

    if (createdAt) {
      payload.createdAt = createdAt;
      payload.updatedAt = createdAt;
    }

    await Post.create(payload);

    req.flash('success', 'Your post was published.');
    return res.redirect('/blog');
  } catch (error) {
    console.error('Create post error:', error);
    req.flash('error', error.status === 400 ? error.message : 'Unable to create post. Please try again.');
    return res.redirect('/blog');
  }
});

router.post('/blog/:id/edit', requireAuth, handleUpload, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const content = (req.body.content || '').trim();

    if (!postId || Number.isNaN(postId)) {
      req.flash('error', 'Invalid post.');
      return res.redirect('/blog');
    }

    if (!content) {
      req.flash('error', 'Post description is required.');
      return res.redirect('/blog');
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect('/blog');
    }

    const currentUser = res.locals.currentUser;
    if (!canManagePost(currentUser, post)) {
      req.flash('error', 'You do not have permission to edit this post.');
      return res.redirect('/blog');
    }

    post.title = resolveTitle(req);
    post.content = content;
    post.category = normalizeCategory(req.body.category);

    if (isAdminUser(currentUser)) {
      post.userId = await resolveAuthorUserId(req, currentUser);
    }

    const createdAt = resolveCreatedAt(req);
    if (createdAt) {
      post.setDataValue('createdAt', createdAt);
      post.changed('createdAt', true);
    }

    if (req.files && req.files.length) {
      await deleteMediaByUrls(parseImages(post.imagePath));
      const imageUrls = await saveUploadedFiles(req.files);
      post.imagePath = serializeImages(imageUrls);
    }

    await post.save({ silent: false });
    req.flash('success', 'Post updated.');
    return res.redirect('/blog');
  } catch (error) {
    console.error('Edit post error:', error);
    req.flash('error', error.status === 400 ? error.message : 'Unable to update post. Please try again.');
    return res.redirect('/blog');
  }
});

router.post('/blog/:id/delete', requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!postId || Number.isNaN(postId)) {
      req.flash('error', 'Invalid post.');
      return res.redirect('/blog');
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect('/blog');
    }

    if (!canManagePost(res.locals.currentUser, post)) {
      req.flash('error', 'You do not have permission to delete this post.');
      return res.redirect('/blog');
    }

    await deleteMediaByUrls(parseImages(post.imagePath));
    await post.destroy();

    req.flash('success', 'Post deleted.');
    return res.redirect('/blog');
  } catch (error) {
    console.error('Delete post error:', error);
    req.flash('error', 'Unable to delete post. Please try again.');
    return res.redirect('/blog');
  }
});

module.exports = router;

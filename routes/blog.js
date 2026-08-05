const express = require('express');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Post, User } = require('../models');
const { requireAuth, canManagePost } = require('../middleware/auth');
const { upload, ensureUploadDir } = require('../middleware/upload');

const router = express.Router();
const PAGE_SIZE = 10;
const MAX_IMAGES = 10;

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

function pathsFromFiles(files) {
  return (files || []).map((file) => `/uploads/blogs/${file.filename}`);
}

function serializePost(post, currentUser) {
  const author = post.author || {};
  const showAuthor = Boolean(currentUser);
  return {
    id: post.id,
    content: post.content,
    images: parseImages(post.imagePath),
    createdAt: post.createdAt,
    author: showAuthor
      ? {
          id: author.id,
          name: author.name || 'Unknown'
        }
      : null,
    canManage: canManagePost(currentUser, post)
  };
}

async function fetchPostsPage({ beforeId, limit = PAGE_SIZE, currentUser }) {
  const where = {};
  if (beforeId) {
    where.id = { [Op.lt]: Number(beforeId) };
  }

  const rows = await Post.findAll({
    where,
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'name']
    }],
    order: [['id', 'DESC']],
    limit: limit + 1
  });

  const hasMore = rows.length > limit;
  const posts = rows.slice(0, limit).map((post) => serializePost(post, currentUser));
  return { posts, hasMore };
}

function removeImageFile(imagePath) {
  if (!imagePath) return;
  const absolute = path.join(__dirname, '../public', imagePath.replace(/^\//, ''));
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
}

function removeImageFiles(paths) {
  parseImages(paths).forEach(removeImageFile);
}

function cleanupUploadedFiles(files) {
  (files || []).forEach((file) => removeImageFile(`/uploads/blogs/${file.filename}`));
}

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
    ensureUploadDir();
    const { posts, hasMore } = await fetchPostsPage({
      currentUser: res.locals.currentUser
    });

    renderPage(res, 'blog-list', {
      title: 'Blogs & Media - Utthan Foundation',
      currentPage: 'blog',
      posts,
      hasMore,
      pageSize: PAGE_SIZE
    });
  } catch (error) {
    console.error('Blog feed error:', error);
    req.flash('error', 'Unable to load the blog feed.');
    renderPage(res, 'blog-list', {
      title: 'Blogs & Media - Utthan Foundation',
      currentPage: 'blog',
      posts: [],
      hasMore: false,
      pageSize: PAGE_SIZE
    });
  }
});

router.get('/blog/api/posts', async (req, res) => {
  try {
    const beforeId = req.query.beforeId ? Number(req.query.beforeId) : null;
    const limit = Math.min(Number(req.query.limit) || PAGE_SIZE, 20);

    if (beforeId !== null && Number.isNaN(beforeId)) {
      return res.status(400).json({ error: 'Invalid beforeId' });
    }

    const result = await fetchPostsPage({
      beforeId,
      limit,
      currentUser: res.locals.currentUser
    });

    return res.json(result);
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Unable to load posts' });
  }
});

router.post('/blog', requireAuth, handleUpload, async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) {
      cleanupUploadedFiles(req.files);
      req.flash('error', 'Post text is required.');
      return res.redirect('/blog');
    }

    await Post.create({
      userId: req.session.userId,
      content,
      imagePath: serializeImages(pathsFromFiles(req.files))
    });

    req.flash('success', 'Your post was published.');
    return res.redirect('/blog');
  } catch (error) {
    console.error('Create post error:', error);
    cleanupUploadedFiles(req.files);
    req.flash('error', 'Unable to create post. Please try again.');
    return res.redirect('/blog');
  }
});

router.post('/blog/:id/edit', requireAuth, handleUpload, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const content = (req.body.content || '').trim();

    if (!postId || Number.isNaN(postId)) {
      cleanupUploadedFiles(req.files);
      req.flash('error', 'Invalid post.');
      return res.redirect('/blog');
    }

    if (!content) {
      cleanupUploadedFiles(req.files);
      req.flash('error', 'Post text is required.');
      return res.redirect('/blog');
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      cleanupUploadedFiles(req.files);
      req.flash('error', 'Post not found.');
      return res.redirect('/blog');
    }

    if (!canManagePost(res.locals.currentUser, post) || res.locals.currentUser.id !== post.userId) {
      cleanupUploadedFiles(req.files);
      req.flash('error', 'You can only edit your own posts.');
      return res.redirect('/blog');
    }

    post.content = content;

    if (req.files && req.files.length) {
      removeImageFiles(post.imagePath);
      post.imagePath = serializeImages(pathsFromFiles(req.files));
    }

    await post.save();
    req.flash('success', 'Post updated.');
    return res.redirect('/blog');
  } catch (error) {
    console.error('Edit post error:', error);
    cleanupUploadedFiles(req.files);
    req.flash('error', 'Unable to update post. Please try again.');
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

    removeImageFiles(post.imagePath);
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

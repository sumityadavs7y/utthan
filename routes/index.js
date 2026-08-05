const express = require('express');
const router = express.Router();
const { Chairman } = require('../models');

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

router.get('/', (req, res) => {
  renderPage(res, 'home', {
    title: 'Utthan Foundation - For The Ones In Need',
    currentPage: 'home',
    isHome: true,
    skin: 'skin-3',
    loaderStyle: 'page-3',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css',
      '/vendor/animate/animate.css'
    ],
    extraJs: [
      '/vendor/wow/wow.js',
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/counter/waypoints-min.js',
      '/vendor/counter/counterup.min.js',
      '/vendor/swiper/swiper-bundle.min.js',
      '/js/dz.carousel.js'
    ]
  });
});

router.get('/about-us', async (req, res) => {
  let chairman = null;
  try {
    chairman = await Chairman.findOne({ order: [['id', 'ASC']] });
  } catch (error) {
    console.error('About us chairman load error:', error);
  }

  renderPage(res, 'about-us', {
    title: 'About Us - Utthan Foundation',
    currentPage: 'about-us',
    chairman,
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/counter/waypoints-min.js',
      '/vendor/counter/counterup.min.js',
      '/vendor/swiper/swiper-bundle.min.js',
      '/js/dz.carousel.js'
    ]
  });
});

router.get('/member', (req, res) => {
  renderPage(res, 'member', {
    title: 'Become A Member - Utthan Foundation',
    currentPage: 'member',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/counter/waypoints-min.js',
      '/vendor/counter/counterup.min.js'
    ]
  });
});

router.get('/donate', (req, res) => {
  renderPage(res, 'donate', {
    title: 'Donate Us - Utthan Foundation',
    currentPage: 'donate',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js'
    ]
  });
});

router.get('/contact', (req, res) => {
  renderPage(res, 'contact', {
    title: 'Contact Us - Utthan Foundation',
    currentPage: 'contact',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/swiper/swiper-bundle.min.js',
      '/js/dz.carousel.js',
      'https://www.google.com/recaptcha/api.js'
    ]
  });
});

module.exports = router;

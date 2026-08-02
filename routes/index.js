const express = require('express');
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

router.get('/about-us', (req, res) => {
  renderPage(res, 'about-us', {
    title: 'About Us - Utthan Foundation',
    currentPage: 'about-us',
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

router.get('/team', (req, res) => {
  renderPage(res, 'team', {
    title: 'Our Team - Utthan Foundation',
    currentPage: 'team',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js'
    ]
  });
});

router.get('/campaigns', (req, res) => {
  renderPage(res, 'campaigns', {
    title: 'Our Campaigns - Utthan Foundation',
    currentPage: 'campaigns',
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
  });
});

router.get('/fundraiser', (req, res) => {
  renderPage(res, 'fundraiser-detail', {
    title: 'Fundraiser - Utthan Foundation',
    currentPage: 'fundraiser',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/swiper/swiper-bundle.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
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

router.get('/certificates', (req, res) => {
  renderPage(res, 'certificates', {
    title: 'Certificates - Utthan Foundation',
    currentPage: 'certificates',
    extraCss: [
      '/vendor/lightgallery/css/lightgallery.min.css',
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/lightgallery/js/lightgallery-all.min.js'
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

router.get('/gallery', (req, res) => {
  renderPage(res, 'gallery', {
    title: 'Gallery - Utthan Foundation',
    currentPage: 'gallery',
    extraCss: [
      '/vendor/lightgallery/css/lightgallery.min.css',
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/magnific-popup/magnific-popup.js',
      '/vendor/lightgallery/js/lightgallery-all.min.js'
    ]
  });
});

router.get('/blog', (req, res) => {
  renderPage(res, 'blog-list', {
    title: 'Blogs & Media - Utthan Foundation',
    currentPage: 'blog',
    extraCss: [
      '/vendor/magnific-popup/magnific-popup.min.css',
      '/vendor/bootstrap-select/css/bootstrap-select.min.css'
    ],
    extraJs: [
      '/vendor/bootstrap-select/js/bootstrap-select.min.js',
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

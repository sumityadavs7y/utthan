const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.render('welcome', {
    message: 'Hello World',
    dbConnected: true
  });
});

module.exports = router;

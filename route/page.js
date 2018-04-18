const express = require('express');
const router = express.Router();

router.get('/', (req, resp, next) => {
  try {
    if (!req.cookies.user) {
      resp.redirect('/signin');
    } else {
      resp.render('index');      
    }
  } catch (err) {
    next(err, req, resp);
  }
});

router.get('/signin', (req, resp, next) => {
  try {
    if (req.cookies.user) {
      resp.redirect('/');
    } else {
      resp.render('signin');
    }
  } catch (err) {
    next(err, req, resp);
  }
});

module.exports = router;


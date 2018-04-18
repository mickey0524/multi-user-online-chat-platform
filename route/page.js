const express = require('express');
const router = express.Router();

router.get('/index', (req, resp, next) => {
  try {
    resp.render('index');
  } catch (err) {
    next(err, req, resp);
  }
});

router.get('/signin', (req, resp, next) => {
  try {
    resp.render('signin');
  } catch (err) {
    next(err, req, resp);
  }
});

module.exports = router;


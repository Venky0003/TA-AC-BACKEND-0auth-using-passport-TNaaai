var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.use(passport.initialize());
router.use(passport.session());
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
});

router.get('/success', (req, res) => {
  res.render('success',{user: req.user});
});

router.get('/login', (req, res, next) => {
  res.render('login', { error: req.flash('error')[0],user: req.user });
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/success',
    failureFlash: true,
  })
);
router.get('/register', (req, res) => {
  res.render('register',{user: req.user});
});

router.post('/register', (req, res) => {
  const { username, password } = req.body;

  User.create(req.body)
    .then((user) => {
      console.log(user);
      res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
      if (
        err.code === 11000 &&
        err.keyPattern &&
        err.keyValue &&
        err.keyValue.email
      ) {
        req.flash('error', 'This Email is taken');
        return res.redirect('/register');
      } else if (err.name === 'ValidationError') {
        let error = err.message;
        req.flash('error', error);
        return res.redirect('/register');
      }
      return res.json({ err });
    });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});


module.exports = router;

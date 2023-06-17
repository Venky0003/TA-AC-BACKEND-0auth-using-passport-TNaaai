var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/auth/github', passport.authenticate('github'));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),(req, res) =>{
    res.redirect('/articles')
  }
);


router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/'
}),(req, res)=>{
  // res.redirect('/articles')
  const displayName = req.user.googleProfile.displayName;

  // Checking if the user already exists
  User.findOne({ email: req.user.email })
    .then((user) => {
      if (user) {
        // User already exists, update the name field
        user.name = displayName;
        return user.save();
      } else {
        // User doesn't exist, create a new user
        return User.create({ email: req.user.email, name: displayName });
      }
    })
    .then(() => {
      res.redirect('/articles');
    })
    .catch((err) => {
      console.error(err);
      res.redirect('/');
    });
});


router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});


module.exports = router;

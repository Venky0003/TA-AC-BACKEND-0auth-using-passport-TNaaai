var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/succes', (req, res) => {
  res.render('succes');
});

router.get('/failure', (req, res) => {
  res.render('failure');
});

router.get('/auth/github', passport.authenticate('github'));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/failure' }),(req, res) =>{
    res.redirect('/succes')
  }
);


// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

module.exports = router;

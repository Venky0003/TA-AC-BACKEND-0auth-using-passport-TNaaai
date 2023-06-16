let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');
let auth = require('../middlewares/auth');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    // console.log(email, password)
    function (req, username,password, done) {
      // console.log(email, password);
      User.findOne({username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
          }

          return user.verifyPassword(password).then((isMatch) => {
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, 'username password')
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});


module.exports = passport; 
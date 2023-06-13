var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/user');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: 'user:email',
    },
    (accessToken, refreshToken, profile, done) => {
    //   console.log(profile);
      var profileData = {
        name: profile.displayName,
        username: profile.username,
        email: profile._json.email,
        photo: profile._json.avatar_url,
      };
      User.findOne({ email: profile._json.email })
        .then((user) => {
          if (!user) {
            User.create(profileData, { addedUser })
              .then(() => {
                return done(null, addedUser);
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            return done(null, user);
          }
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
  User.findById(id, 'name email username').then((user) => {
    done(null, user);
  }).catch((err) => {
    done(err);
  });
});


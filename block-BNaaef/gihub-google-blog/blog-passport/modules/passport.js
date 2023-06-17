let passport = require('passport');
let GitHubStrategy = require('passport-github').Strategy;
let GoogleStrategy = require('passport-google-oauth20').Strategy;
let User = require('../models/user');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    },

    (accessToken, refreshToken, profile, done) => {
      var profileData = {
        name: profile.displayName,
        email: profile._json.email,
      };
      let email = profile._json.email;
      let name = profileData.name;
      console.log(profileData);
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            User.create({ email, name })
              .then((addedUser) => {
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


//google strategy
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // console.log(profile)
        var profileData = {
          name: profile.displayName,
          email: profile._json.email,
        };
        console.log(profileData)
        let email = profile._json.email;
        User.findOne({ email })
          .then((user) => {
            if (!user) {
              User.create({ email, googleProfile: profileData })
                .then((addedUser) => {
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
    User.findById(id, 'name email')
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  });
  
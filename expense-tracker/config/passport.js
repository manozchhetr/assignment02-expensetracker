const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('./keys');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
      // Match user
      User.findOne({ username: username })
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'No user found' });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        })
        .catch(err => done(err));
    })
  );

  // GitHub Strategy
  passport.use(new GitHubStrategy({
    clientID: keys.GithubClientID,
    clientSecret: keys.GithubClientSecret,
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Find or create user logic here
    User.findOne({ githubId: profile.id }).then(user => {
      if(user) {
        return done(null, user);
      } else {
        const newUser = new User({
          githubId: profile.id,
          username: profile.username
        });
        newUser.save().then(user => done(null, user));
      }
    }).catch(err => done(err));
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};

function setupAuth(User, Config, app) {
  var passport = require('passport');
  var FacebookStrategy = require('passport-facebook').Strategy;
  var cors = require('cors');

  // High level serialize/de-serialize configuration for passport
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.
      findOne({ _id : id }).
      exec(done);
  });

  // Facebook-specific
  passport.use(new FacebookStrategy(
    {
      clientID: Config.facebookClientId,
      clientSecret: Config.facebookClientSecret,
      callbackURL: 'https://meanstackretail.herokuapp.com/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      if (!profile.displayName) {
      //if (!profile.emails || !profile.emails.length) {
        return done('No name associated with this account!');
      }

      User.findOneAndUpdate(
        { 'data.oauth': profile.id },
        {
          $set: {
            //'profile.username': profile.emails[0].value,
            'profile.username': profile.displayName,
            'profile.picture': 'http://graph.facebook.com/' +
              profile.id.toString() + '/picture?type=large'
          }
        },
        { 'new': true, upsert: true, runValidators: true },
        function(error, user) {
          done(error, user);
        }
      );
    }));

  // Express middlewares
  app.use(require('express-session')({ secret: 'this is a secret' }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Express routes for auth
  app.get('/auth/facebook',  passport.authenticate('facebook'),
      function(req, res){

  });

  app.get('/auth/facebook/callback', function(req, res, next) {
        
    passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
    });

    })(req,res,next);
  });
}

module.exports = setupAuth;

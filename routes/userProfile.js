const express = require('express');
const User = require('../models/user');
const Campground = require('../models/campground');
var router = express.Router();


// User profile
router.get('/:id', function (req, res) {
  User.findById(req.params.id, function (err, foundUser) {
    if (err) {
      req.flash('error', 'The User No Longer Exists!');
      return res.redirect('/');
    }
    Campground.find().where('author.id').equals(foundUser.id).exec(function (err, campgrounds) {
      if (err) {
        req.flash('error', 'The Post From This User No Longer Exists!');
        res.redirect('/');
      } else {
        res.render('users/show', { user: foundUser, campgrounds: campgrounds });
      }
    });
  });
});

// show forgot password
router.get('/forgotpassword', function (req, res) {
  res.render('users/forgot');
});

// handle forgot password logic
router.post('/forgotpassword', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No Account With That Email Address Exists!');
          return res.redirect('/forgotpasssword');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 900000;

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'pmachine7@gmail.com',
          pass: process.env.GMAILPW
        }
      });

      var mailOptions = {
        to: user.email,
        from: 'pmachine7@gmail.com',
        subject: 'YelpCamp Password Reset',
        text: 'You are receive this because you (or someone eles) have requested the reset of the password for your account. \n' +
          'Please click on the following link or paste this into your browser to complete the process. \n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.'
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail Has Been Sent To ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/forgotpassword');
  });
});

// show reset password form
router.get('/reset/:token', function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  },
    function (err, user) {
      if (!user) {
        req.flash('error', 'Password Reset Token Is Invalid Or Has Expired!');
        return res.redirect('/forgot');
      }
      res.render('users/reset', { token: req.params.token });
    });
});

// handle reset password logic
router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
        function (err, user) {
          if (!user) {
            req.flash('error', 'Password Reset Token Is Invalid Or Has Expired!');
            return res.redirect('back');
          }
          if (req.body.password === req.body.confirmPassword) {
            user.setPassword(req.body.password, function (err) {

              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save(function (err) {
                req.logIn(user, function (err) {
                  done(err, user);
                });
              });
            });
          } else {
            req.flash('error', 'Password Do Not Match!');
            return res.redirect('back');
          }
        });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'pmachine7@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'pmachine7@gmail.com',
        subject: 'Your Password Has Been Changed.',
        text: 'Hello, \n\n' +
          'This is a confirmation that the password for your account ' + user.email + 'has been changed.'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! Your Password Has Been Changed.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/campgrounds');
  });
});

module.exports = router;
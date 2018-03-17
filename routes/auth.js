const express = require('express');
const Campground = require('../models/campground');
const comment = require('../models/comment');
const User = require('../models/user');
const passport = require('passport');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
var router = express.Router();

// root
router.get('/', function(req, res) {
  res.render("landing");
});

//  show register
router.get('/register', function(req, res) {
  res.render('users/register', {page: 'register'});
});

// handle sign up logic
router.post('/register', function(req, res) {
  var newUser = new User(
    {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      avatar: req.body.avatar,
    });
  if(req.body.adminCode === 'wolf') {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('/register');
    }
    passport.authenticate('local')(req, res, function() {
      req.flash('success', 'Welcome To YelpCamp ' + user.username);
      res.redirect('/campgrounds');
    });
  });
});

// show login form
router.get('/login', function(req, res) {
  res.render('users/login', {page: 'login'});
});

// hadling login logic
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }),
  function(req, res) {
});

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'Logged You out!');
  res.redirect('/campgrounds');
});

module.exports = router;

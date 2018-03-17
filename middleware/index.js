const Campground = require('../models/campground');
const Comment = require('../models/comment');

// All the middleware goes here
var middlewareObject = {};

middlewareObject.checkCampgroundOwnership  = function(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      if (err || !foundCampground) {
        req.flash('error', 'Campground Not Found!');
        res.redirect('back');
      } else {
        // does user own the campground
        if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'You Do Not Have The Permission To Do That');          
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('You Need To Be Logged In To Do That!');
    res.redirect('back');
  }
};

middlewareObject.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err || !foundComment) {
        req.flash('error', 'Comment Not Found!');
        res.redirect('back');
      } else {
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'You Do Not Have The Permission To Do That!');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You Need To Be Logged In To Do That!');
    res.redirect('back');
  }
};

middlewareObject.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You Need To Be Logged In To Do That!');
  res.redirect('/login');
};

module.exports = middlewareObject;
const express = require('express');
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
var router = express.Router({mergeParams: true});

//  Comments New
router.get('/new', middleware.isLoggedIn, function(req, res) {
  // find campground by id
  Campground.findById(req.params.id, function(err, campground) {
    if(err) {
      console.log(err);
    } else {
      res.render('comments/new', {campground: campground});
    }
  });
});

// Comments Create
router.post('/', middleware.isLoggedIn, function(req, res) {
  // lookup campground using id
  Campground.findById(req.params.id, function(err, campground) {
    if(err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      // create new comment
      Comment.create(req.body.comment, function(err, comment) {
        if(err) {
          req.flash('error', 'Something Went Wrong!');
          console.log(err);
        } else {
          // add username and id to the comment
          comment.author.id = req.user._id;
          comment.author.username =  req.user.username;
          comment.save();
          // connect new comment to the campground
          campground.comments.push(comment);
          campground.save();
          // redirect to campground show page
          req.flash('success', 'Successfully Addded Comment!');
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

// Edit comments
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err || !foundCampground) {
      req.flash('error', 'Campground Not Found');
      return res.redirect('back');
    }
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        res.redirect('back');
      } else {
        res.render('comments/edit', { campground_id: req.params.id, comment: foundComment });
      }
    }); 
  });
});

// Update Comment
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    if (err || !foundCampground) {
      req.flash('error', 'Campground Not Found');
      return res.redirect('back');
    }
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
      if(err) {
        res.redirect('back');
      } else {
        res.redirect('/campgrounds/' + req.params.id);
      }
    });
  });
});

// Delete Comment
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if(err) {
      console.log('err', err);
      res.redirect('back');
    } else {
      req.flash('success', 'Comment Deleted!');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

module.exports = router;

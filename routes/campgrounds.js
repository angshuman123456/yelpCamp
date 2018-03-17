const express = require('express');
const Campground = require('../models/campground');
const middleware = require('../middleware');
const geocoder = require('geocoder');
const request = require('request');
const multer = require('multer');
const cloudinary = require('cloudinary');

var router = express.Router();
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only Image Files Are Allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});

cloudinary.config({
  cloud_name: 'angshuman',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX - show all the campgrounds
router.get('/', function(req, res) {
  let perPage = 8;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
      Campground.count({name: regex}).exec(function(err, count) {
        if (err) {
          req.flash('error', 'Sorry Unable To Get List Of Campgrounds!');
          return res.redirect('back');
        }
        if(allCampgrounds < 1) {
          var noMatch = 'No Campgrounds Found Containing "' + req.query.search + '". Please Try Again.';
          req.flash('error', noMatch);
          return res.redirect('/campgrounds');
        }
        res.render("campgrounds/index", { campgrounds: allCampgrounds, current: pageNumber, 
                                          pages: Math.ceil(count / perPage) });
      });
    });
  } else {
    // get all the campground from DB
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCampgrounds) {
      Campground.count().exec(function(err, count) {
        if(err) {
          console.log(err);
        } else {
          res.render("campgrounds/index", { campgrounds: allCampgrounds, current: pageNumber, 
                                            pages: Math.ceil(count / perPage) });
        }
      });
    });
  }
});

// CREATE - add new campground to the db
router.post('/', middleware.isLoggedIn, upload.single('image'), function(req, res) {
  let name = req.body.name;
  let desc = req.body.description;
  let price = req.body.price;
  let author = {
    id: req.user._id,
    username: req.user.username
  };
  geocoder.geocode(req.body.location, function(err, data) {
    if(err) {
      req.flash('error', 'Could Not Add Campground!');
      return res.redirect('/new');
    }
    let lat = data.results[0].geometry.location.lat;
    let lng = data.results[0].geometry.location.lng;
    let location = data.results[0].formatted_address;

    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      let image = result.secure_url;
      let newCampground = {name: name, image: image, description: desc, author: author, price: price, location: location, lat: lat, lng: lng};
      Campground.create(newCampground, function(err, newlyCreated) {
        if(err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds');
      });
    });
  });
});

// NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
  res.render('campgrounds/new');
});

// SHOW - will display a single campground and a lot more details about it
router.get('/:id', function(req, res) {
  // find the campground with provided ID
  Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
    if(err || !foundCampground) {
      req.flash('error', 'Campground Not Found!');
      res.redirect('/campgrounds');
    } else {
      // render show template with that campground
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});

// Edit campground
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err) {
      res.redirect('/campgrounds');
    } else {
      res.render('campgrounds/edit', {campground : foundCampground});
    }
  });
});

// Update campground
router.put('/:id', middleware.checkCampgroundOwnership, upload.single('image'), function(req, res) {

  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    let image = result.secure_url;
    let newData = {name: req.body.name, image: image, description: req.body.description,
                  cost: req.body.cost};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedCampground) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('/campgrounds');
      }
      req.flash('success', 'Successfully Updated!');
      res.redirect('/campgrounds/' + req.params.id);
    });
  });
});

// Destroy Campground
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds');
    }
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
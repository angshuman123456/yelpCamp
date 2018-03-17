const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const localStrategy = require('passport-local');
const passport = require('passport');
const flash = require('connect-flash');

const seedsDB = require('./seeds');
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');

//  requiring routes
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userProfile');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/yelp_camp', {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');

// seedsDB(); // seed the database

// PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret: "I am in love with maggie!",
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use(authRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/users', userRoutes);

app.listen(4000, function() {
  console.log("The server has started!!");
});

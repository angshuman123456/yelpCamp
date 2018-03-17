// It is for the dummy data so that we can immediately see the data reflected into the campgrounds

const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

var data = [
  {
    name: 'Cloud\'s Rest',
    image: 'https://media.wired.com/photos/599b4cfd4fa6fc733c11e30d/master/pass/iStock-820873602.jpg',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  },
  {
    name: 'Desert Mesa',
    image: 'https://www.hellobc.com/getmedia/ad69f20d-378d-49f2-af54-63b580d4b2ed/6-2628-Stone-Mountain-Provincial-Park.jpg.aspx',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  },
  {
    name: 'Canyon Floor',
    image: 'http://s3.amazonaws.com/digitaltrends-uploads-prod/2017/06/camping-tent-1500x1000.png',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  }
]


function seedDB() {
  // Adding a new campground
  Campground.remove({}, function(err) {
    // if(err) {
    //   console.log(err);
    //   }
    //   console.log('removed campgrounds!!');
    //
    //   // add a few campgrounds
    //   data.forEach(function(seed) {
    //     Campground.create(seed, function(err, campground) {
    //       if(err) {
    //         console.log(err);
    //       } else {
    //         console.log('added a campground');
    //
    //         // add a few comments
    //         Comment.create({
    //           text: 'This place was great but I wish I had internet',
    //           author: 'Homer'
    //         }, function(err, comment) {
    //           if(err) {
    //             console.log(err);
    //           } else {
    //             campground.comments.push(comment);
    //             campground.save();
    //             console.log('created a new comment');
    //           }
    //         });
    //       }
    //     });
    //   });
    });
};

module.exports = seedDB;

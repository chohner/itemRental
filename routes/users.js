var models  = require('../models');
var express = require('express');
var router  = express.Router();


router.get('/listUsers', function(req, res) {
  models.User.findAll().then(function(users){
    res.json({'users': users});
  });
});


router.post('/createUser', function(req, res) {
  // TODO: check if user with username exists
  // TODO: dont use param and .success
  models.User.create({
    username: req.param('username'),
    firstname: req.param('firstname'),
    lastname: req.param('lastname'),
    email: req.param('email'),
    role: req.param('role'),
    active: req.param('active'),
  }).success(function(title) {
    res.redirect('./');
  }).error(function(error){
    console.log(error);
    res.redirect('./');
  })
});

// Check User route, returns user details
router.post('/checkUser', function(req,res) {
  models.User.find({
    where: {username: req.body.username}
    //include: [ models.Item ]
  }).then(function(myUser){
    res.send(myUser);
  })
});

// checkUserItems Route, returns all borrowed items from username
router.post('/checkUserItems', function(req,res) {
  models.User.find({
    where: {username: req.body.username}
    //include: [ models.Item ]
  }).then(function(myUser){
    myUser.getItems().then(function(associatedItems) {
      res.send(associatedItems)
    })
  })
});


module.exports = router;

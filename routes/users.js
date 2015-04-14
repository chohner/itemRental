var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'admin'){
    models.User.findAll().then(function(users){
      res.json({'users': users});
    })
  } else {
    res.status(401).end();
  };
});


router.post('/create', function(req, res) {
  // TODO: check if user with username exists
  // TODO: dont use param and .success
  if ( req.session.user && req.session.user.role == 'admin'){
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
  } else {
    res.status(401).end();
  }
});

// Check route: Admin can check all users, everyone else just themselves, if theyre logged in
// TODO: enable /:user/check
router.post('/check', function(req,res) {
  if ( req.session.user && req.session.user.role == 'admin'){
    models.User.find({
      where: {username: req.body.username}
    }).then(function(myUser){
      res.send(myUser);
    })
  } else if (req.session.user){
    models.User.find({
      where: {username: req.session.user.username}
    }).then(function(myUser){
      res.send(myUser);
    })
  } else {
    res.status(401).end();
  }
});

// TODO: Check items of user. Admin can check everyone, everyone else just themselves, if theyre logged in
// TODO: enable /:user/checkItems
router.post('/checkItems', function(req,res) {
  if ( req.session.user && req.session.user.role == 'admin'){
  } else if (req.session.user){
  } else {
    res.status(401).end();
  }
});

module.exports = router;

var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
    models.User.findAll().then(function(users){
      res.json({'users': users});
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  };
});


router.post('/create', function(req, res) {
  // TODO: check if user with username exists
  // TODO: dont use param and .success
  if ( req.session.user && req.session.user.role == 'Admin'){
    models.Users.findOrCreate({
      where: {username: req.body.username},
      defaults:  {firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  email: req.body.email,
                  role: req.body.role,
                  active: req.body.active
                }
    }).spread(function(user, created){
      if (created) {
        res.status(200).send('Success: Created user:' + user.username);
      } else {
        res.status(409).end('Error: user' + user.username' already exists.');
      }
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});

// Check route: Admin can check all users, everyone else just themselves, if theyre logged in
// TODO: enable /:user/check
router.post('/check', function(req,res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
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
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});

// TODO: Check items of user. Admin can check everyone, everyone else just themselves, if theyre logged in
// TODO: enable /:user/checkItems
router.post('/checkItems', function(req,res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
  } else if (req.session.user){
  } else {
    res.status(401).send('Error: You need to be logged.');
  }
});

module.exports = router;

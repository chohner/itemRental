var models  = require('../models');
var express = require('express');
var router  = express.Router();

// TODO: GET /users/:username/items route, restrict for normal users

router.get('/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
    models.User.findAll().then(function(users){
      res.json({'users': users});
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  };
});

// POST /users/ route
// Upserts (update / insert) user with provided data

router.post('/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'Admin'){

    models.User.upsert({
      username : req.body.username,
      firstname : req.body.firstname,
      lastname : req.body.lastname,
      role: req.body.role,
      active: req.body.active
    }).then(function(){
      res.status(200).send('User' + req.body.username + ' successfully updated / added.');
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});


// DELETE /:username route
router.delete('/:username/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'Admin'){

    models.User.find({
      where: {username : req.params.username}
    }).then(function(myUser){
      if (myUser) {
        myUser.destroy().then(function(){
          res.status(200).send('User ' + myUser.username + ' was removed.');
        })
      } else {
        res.status(404).send('User with id ' + req.params.user + ' was not found.');
      }
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  };
});

// GET /users/check: returns own user info
router.get('/check', function(req, res) {
 if (req.session.user){
    models.User.find({
      where: {username: req.session.user.username}
    }).then(function(myUser){
      res.json({'user': myUser});
    })
  } else {
    res.status(401).send('Error: You need to be logged in.');
  }
});

// TODO: Check items of user. Admin can check everyone (send username req), everyone else just themselves
// TODO: enable /:user/checkItems
router.get('/checkItems', function(req,res) {
  if (req.session.user){
    models.User.find({
      where: {username: req.session.user.username}
    }).then(function(myUser){
      myUser.getItems().then(function(foundItems){
        res.json({'items': foundItems});
      });
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});

// GET syncWithLDAP Route
// Fetches users from config.userURL and adds them to the db with the correct role
// TODO: option to drop or update users, now it just adds
router.get('/syncWithLDAP', function(req, res){
  if ( req.session.user && req.session.user.role == 'Admin'){

    // php-serialization is needed to unserialize the user dump
    var unserialize = require("php-serialization").unserialize;
    var https = require('https');

    // load config.js
    var config = require('../config');
    var adminList = config.adminList;

    // There's probably a better way but this works..
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    var phpData = '';
     
    var req = https.get(config.userURL, function(httpRes) {

      // We dont need to buffer objects
      httpRes.setEncoding('binary');

      console.log('Connection to userlist successfull:')
      console.log('statusCode: ', httpRes.statusCode);
      //console.log('headers: ', httpRes.headers); // verbose

      // Concatinate the received data chunks
      httpRes.on('data', function(chunk) {
          phpData += chunk;
      }).on('end', function(){

        // The received data now lies in a pretty horrible format:
        // For example "phpData.__attr__['username'].val.__attr__.uid.val" returns the uid/username 

        var data = unserialize(phpData).__attr__;
        var users = Object.keys(data);

        var userList = [];

        // Iterate through data object and add a new username, firstname, lastname and appropriate role to userList array
        users.forEach(function(user) {
            var userAttributes = data[user].val.__attr__;

            if (userAttributes.uid.val && userAttributes.givenname.val && userAttributes.sn.val) {
                userRole = adminList.indexOf(userAttributes.uid.val) > -1 ? 'Admin' : 'User';

                console.log('User found: ' + userAttributes.uid.val + ' ('+ userRole + ')' )
                userList.push({
                    username : userAttributes.uid.val,
                    firstname : userAttributes.givenname.val,
                    lastname : userAttributes.sn.val,
                    role: userRole
                });
            }
        });

        console.log('Fetched a total of ' + userList.length + ' users.')

        // Update the db with found users, ignoring any duplicates
        models.User.bulkCreate(
          userList, {
            ignoreDuplicates: true
          }
        ).then(function() {
            res.end('Fetched a total of ' + userList.length + ' users.');
        })
      })
    }).on('error', function(e) { // show an errors during data fetching
      console.error(e);
    });
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});

// GET /users/:user: returns user info to admin, both id and username are valid
router.get('/:user', function(req, res) {

  if ( req.session.user && req.session.user.role == 'Admin'){

    // if input is a number, search the ids, otherwise the usernames
    var searchKey = (!isNaN(req.params.user)) ? 'id' : 'username';

    var searchOpt = {};
    searchOpt[searchKey] = req.params.user;

    models.User.find({
      where : searchOpt
    }).then(function(myUser){
      if(myUser) {
        res.json({'user': myUser});
      } else {
        res.status(404).send('User with id ' + req.params.user + ' was not found.');
      }
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});


module.exports = router;

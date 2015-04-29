var models  = require('../models');
var express = require('express');
var router  = express.Router();

var useLDAP = true;

// TODO get users with listUsers API call
router.get('/', function(req, res) {
  models.Item.max('label')
  .then(function(maxLabel) {
    res.render('index', {
      curUser: req.session.user, //probably not very secure
      maxLabel: maxLabel
    })
  })
});

// POST login route. first looks for username in db, then checks pw against LDAP server
router.post('/login', function(req,res) {
  models.User.findAndCountAll({
    where: {username : req.body.username}
  }).then(function(result){
    if(result.count == 0){

      // User not found in db: send 401
      res.status(401).end();
    } else {

      // if we want to use LDAP, call ldapCheck with provided username and password, otherwise we're done!
      if (useLDAP) {
        // Found user - search for username in LDAP and try logging in with provided pw
        ldapCheck(req.body.username, req.body.password, function(loginSuccessful){

          if (loginSuccessful) {

            req.session.user = result.rows[0];
            res.status(200).send(result.rows);
          } else {
            res.status(401).send('Check password!');
          }
        })
      } else {
        req.session.user = result.rows[0];
        res.status(200).send(result.rows);
      }
    };
  })
});

router.all('/logout', function(req,res,next) {
  req.session.destroy(function(err) {
    console.log(err);
    res.redirect('/');
  })
});


// TODO documentation
function ldapCheck(username, password, callback) {
  if (!password) {
    console.log('no password provided')
    return false
  }
  var ldap = require('ldapjs');

  // load config.js
  var config = require('../config');

  // Create LDAP client with provided URL
  var client = ldap.createClient({
    url: config.ldapURL
  });

  var searchOpts = { filter: '(' + config.ldapSearchFilter + '='+ username +')',
                      scope: config.ldapSearchScope };

  var foundUser = null;

  // Connect as system to LDAP
  console.log('Attempting to connect to LDAP server..');

  client.bind(config.ldapAuthUser, config.ldapAuthPW, function(err){
    if ( !err ) {
      console.log('Connection successful, searching user ...')

      client.search(config.ldapSearchBase, searchOpts, function(err, res) {

        res.on('searchEntry', function(entry) {
          foundUser = entry.object.dn;
          console.log(JSON.stringify(foundUser));
        });

        res.on('end', function(searchResults) {
          if (foundUser){
            console.log('User found: ' + JSON.stringify(foundUser) + '\nChecking provided password..');

            client.bind(foundUser, password, function(error){
              if(error){
                console.log('User ' + username + ' was found in DB and LDAP but password didnt match.')
                callback(false);
              } else {
                console.log('User ' + username + ' successfully logged in.')
                callback(true);
              }
            })

          } else {
            console.log('User ' + username + ' not found in LDAP system.');
            client.unbind();
            callback(false);
          }          
        })
      })
    } else {
      console.log('LDAP bind Error: ' + JSON.stringify(err))
      client.unbind();
      callback(false);
    }
  })
}

module.exports = router;

var models  = require('../models');
var express = require('express');
var router  = express.Router();

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

// TODO LDAP check
router.post('/login', function(req,res) {
  models.User.findAndCountAll({
    where: {username : req.body.username}
  }).then(function(result){
    if(result.count == 0){
      res.status(401).end();
    } else {
      req.session.user = result.rows[0];
      res.status(200).send(result.rows);
    };
  })
});

router.all('/logout', function(req,res,next) {
  req.session.destroy(function(err) {
    console.log(err);
  })
  res.redirect('/');
});

// Redirect all unmatched routes to index
// app.all('*', function(req, res) {
//   res.redirect('/');
// });

// auth middleware, might be interesting later
// function requiredAuthentication(req, res, next) {
//   if (req.session.user) {
//     next();
//   } else {
//     req.session.error = 'Access denied!';
//     res.redirect('/');
//   }
//}


module.exports = router;

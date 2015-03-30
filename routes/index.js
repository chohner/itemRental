var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  query = req.param('s');
  models.User.findAll({
    include: [ models.Item ]
  }).then(function(users) {
    models.Item.findAll({
    }).then(function(items){
      res.render('index', {
        users: users,
        items: items,
        search: query
      })
    });
  });
});

router.get('/admin', function(req, res) {
  models.User.findAll({
    include: [ models.Item ]
  }).then(function(users) {
    models.Item.findAll({
    }).then(function(items){
      res.render('admin', {
        users: users,
        items: items
      })
    });
  });
});

// router.get('/admin', function(req,res){
// 	// TODO: add admin check

//   models.User.findAll({
//     include: [ models.Item ]
//   }).then(function(users,items){
//     res.render('admin', {
//       users:users,
//       items:items
//     });
//   })
// });


module.exports = router;

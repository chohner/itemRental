var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/listItems', function(req, res) {
  models.Item.findAll().then(function(items){
    res.json({'items': items});
  });
});


router.post('/createItem', function(req, res) {
  models.Item.findOrCreate({
    where: {
      label: req.body.label,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      url: req.body.url,
      location: req.body.location,
      status: req.body.status,
      condition: req.body.condition,
      comment: req.body.comment
    },
    defaults: {
      status: 'available',
      condition: 'working'
    }
  })
  .spread(function(item, created) {
    console.log(item.get({
      plain: true
    }))
    console.log(created)
  })
  res.redirect('./');
});


// createItems Bulk POST
// receives stringified JSON array of objects
// TODO check format of input
router.post('/createItemsBulk', function(req, res) {
  bulkData = req.body;
  models.Item.bulkCreate(
    bulkData
  ).then(function(){
    models.Item.findAll().then(function(items){
      res.send(items);
    })
  });
});


// Borrow Item route: send username and item label to borrow item
router.post('/borrowItem', function(req,res) {
  
  // TODO: check if already borrowed (if same user -> confirm, else -> error)
  // TODO: handle missing item/user error

  models.Item.find({
    where: {label: req.body.label}
  }).then(function(borrowItem){
    models.User.find({
      where: {username: req.body.username}
    }).then(function(borrowUser){
      // borrowItem is item to be checked out
      // borrowUser is user that is checking out
      borrowItem.setUser(borrowUser.id);
      res.send(borrowItem)
    })
  });
});

// Check Item route, returns Item details from label
router.post('/checkItem', function(req,res) {
  models.Item.find({
    where: {label: req.body.label}
  }).then(function(Item){
    res.send(Item)
  })
});

module.exports = router;

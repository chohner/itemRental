var models  = require('../models');
var express = require('express');
var router  = express.Router();

// ## GET /items/ - gets all items
// TODO: restrict some info if not logged in
router.get('/', function(req, res) {
  models.Item.findAll().then(function(items){
    res.json({'items': items});
  });
});

// ## POST /items/ - create item if new label
// TODO: check if label already exists
router.post('/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
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
  } else {
    res.status(401).end();
  }
});

// ## GET /items/:item_label - get single item from label
router.get('/:item_label', function(req,res) {
  models.Item.find({
    where: {label: req.params.item_label}
  }).then(function(Item){
    res.send(Item)
  })
});

// ## POST /items/:item_label - update single item from label
// TODO: update function
router.post('/:item_label', function(req,res) {
  models.Item.find({
    where: {label: req.params.item_label}
  }).then(function(Item){
  })
});

// ## DELETE /items/:item_label - delete single item from label
// TODO: delete function
router.delete('/:item_label', function(req,res) {
  models.Item.find({
    where: {label: req.params.item_label}
  }).then(function(Item){
  })
});

// ## POST /items/checkout/:item_label - check out item with label

router.post('/checkout/:item_label', function(req,res) {
  // TODO: check if already borrowed (if same user -> confirm, else -> error)
  // TODO: stop if item doesnt exist

  if ( req.session.user ){
    models.Item.find({
      where: {label: req.params.item_label}
    }).then(function(borrowItem){
      models.User.find({
        where: {username: req.session.user.username}
      }).then(function(borrowUser){
        borrowItem.setUser(borrowUser.id);
        res.status(200).end();
      })
    })
  } else {
    res.status(401).end();
  }
});

// ## POST /items/createBulk - create Bulk of items

// receives stringified JSON array of objects
router.post('/createBulk', function(req, res) {
  // TODO check format of input

  if ( req.session.user && req.session.user.role == 'Admin'){
    bulkData = req.body;
    models.Item.bulkCreate(
      bulkData
    ).then(function(){
      models.Item.findAll().then(function(items){
        res.send(items);
      })
    });
  } else {
    res.status(401).end();
  }
});

module.exports = router;

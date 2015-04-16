var models  = require('../models');
var express = require('express');
var router  = express.Router();

// ## GET /items/ - gets all items
router.get('/', function(req, res) {
  // TODO: restrict some info if not logged in

  models.Item.findAll().then(function(items){
    res.json({'items': items});
  });
});

// ## POST /items/ - create item if new label
// only label should be matched, the rest ignored or overwritten, so we can use this to update
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

// ## POST /items/checkout/:item_label - check out item with label

// Checkout route: send username and item label to borrow item
router.post('/checkout', function(req,res) {
  // TODO: add :item/checkout route
  // TODO: check if already borrowed (if same user -> confirm, else -> error)
  // TODO: stop if item doesnt exist
  // TODO: use req.session.user.username as default

  if ( req.session.user ){
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
    })
  } else {
    res.status(401).end();
  }
});

// ## GET /items/:item_label - get single item from label

// Check Item route, returns Item details from label
router.post('/check', function(req,res) {
  models.Item.find({
    where: {label: req.body.label}
  }).then(function(Item){
    res.send(Item)
  })
});

// ## POST /items/:item_label - uodate single item from label


// ## DELETE /items/:item_label - delete single item from label


module.exports = router;

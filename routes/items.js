var models  = require('../models');
var express = require('express');
var router  = express.Router();

// ## POST /items/createBulk - create Bulk of items
// receives stringified JSON array of objects
router.post('/createBulk', function(req, res) {
  // TODO check format of input
  if ( req.session.user && req.session.user.role == 'Admin'){
    bulkData = req.body;

    models.Item.bulkCreate(
      bulkData, {ignoreDuplicates: true}
    ).then(function(){
      models.Item.findAll().then(function(items){
        res.send(items);
      })
    });
  } else {
    res.status(401).end();
  }
});

// ## GET /items/ - gets all items
// TODO: restrict some info if not logged in
router.get('/', function(req, res) {
  models.Item.findAll().then(function(items){
    res.json({'items': items});
  });
});

// ## POST /items/ - create item if new label
// Pretty ugly due to foreignKey constrains. removes owner if empty or null
router.post('/', function(req, res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
    if (req.body.owner) {
      if (req.body.owner === 'null' || req.body.owner === 'NULL') {
        models.Item.upsert({
          Label: req.body.label,
          Item: req.body.name,
          Description: req.body.description,
          Category: req.body.category,
          URL: req.body.url,
          Location: req.body.location,
          Status: req.body.status,
          Condition: req.body.condition,
          Comment: req.body.comment
        }).then(function(){
          models.Item.find({where: {Label: req.body.label}}).then(function(foundItem){
            foundItem.setUser(null);
            res.status(200).send('Success: ' + req.body.label + ' successfully updated / added.');
          })
        })
      } else { // req.body.owner was not null
        models.User.find({where:{username: req.body.owner}}).then(function(foundUser){
          if (foundUser) {
            models.Item.upsert({
              Label: req.body.label,
              Item: req.body.name,
              Description: req.body.description,
              Category: req.body.category,
              URL: req.body.url,
              Location: req.body.location,
              Status: req.body.status,
              Condition: req.body.condition,
              Comment: req.body.comment,
              Owner: req.body.owner
            }).then(function(){
              res.status(200).send('Success: ' + req.body.label + ' successfully updated / added.');
            })
          } else { // User of req.body.owner was not found
            res.status(404).send('Error: User ' + req.body.owner + ' was not found.')
          }
        })
      }
    } else { // no req.body.owner sent
      models.Item.upsert({
        Label: req.body.label,
        Item: req.body.name,
        Description: req.body.description,
        Category: req.body.category,
        URL: req.body.url,
        Location: req.body.location,
        Status: req.body.status,
        Condition: req.body.condition,
        Comment: req.body.comment,
        Owner: req.body.owner
      }).then(function(){
        res.status(200).send('Success: ' + req.body.label + ' successfully updated / added.');
      })
    }
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  }
});

// ## GET /items/:item_label - get single item from label
router.get('/:item_label', function(req,res) {
  var searchLabelInt = parseInt(req.params.item_label, 10);
  if (!isNaN(searchLabelInt)) {
    models.Item.find({
      where: {label: req.params.item_label}
    }).then(function(Item){
      if (Item) {
        res.send(Item);
      } else {
        res.status(404).send('Error: Item not found.');
      };
    })
  } else {
    res.status(400).send('Error: Item label should be a number.')
  }
  
});

// ## DELETE /items/:item_label - delete single item from label
// TODO: delete function
router.delete('/:item_label', function(req,res) {
  if ( req.session.user && req.session.user.role == 'Admin'){
    models.Item.find({
      where: {label: req.params.item_label}
    }).then(function(myItem){
      if(myItem) {
        myItem.destroy().then(function(){
          res.status(200).send('Success: Item ' + myItem.Label + ' - ' + myItem.Item + ' was removed.');
        })
      } else {
        res.status(404).send('Error: No item with label ' + req.params.item_label + ' found.')
      }
    })
  } else {
    res.status(401).send('Error: You need to be logged in as Admin.');
  };
});

// ## GET :item_label/owner - returns limited owner details of item
router.get('/:item_label/owner', function(req, res) {
  models.Item.find({
    where: {label: req.params.item_label}
  }).then(function(foundItem) {
    if (foundItem) {
      foundItem.getUser().then(function(foundUser) {
        if (foundUser) {
          res.json( { username: foundUser.username,
                      firstname: foundUser.firstname,
                      lastname: foundUser.lastname })
        } else {
          res.status(404).send('Error: Item has no associated User.');
        }
      })
    }
    else {
      res.status(404).send('Error: Item not found.');
    }
  })
});

// ## POST :item_label/owner - Sets owner of item
router.post('/:item_label/owner', function(req, res) {
  if ( req.session.user ){
    models.Item.find({
      where: {label: req.params.item_label}
    }).then(function(foundItem) {
      if (foundItem) {
        foundItem.setUser(req.session.user.username);
        res.status(200).send('Success: Item ' + req.params.item_label + ' (' + foundItem.Item + ') was checked out by ' + req.session.user.username);
      }
      else {
        res.status(404).send('Error: Item not found.');
      }
    })
  } else {
    res.status(401).send('Error: You need to be logged in to check out items.');
  }
});

// ## DELETE :item_label/owner - Deletes owner of item (aka returns item)
router.delete('/:item_label/owner', function(req, res) {
  if ( req.session.user ){
    models.Item.find({
      where: {label: req.params.item_label}
    }).then(function(foundItem){
      if (foundItem) {
        foundItem.getUser().then(function(oldUser){
          if (oldUser) {
            foundItem.setUser(null);
            res.status(200).send('Success: Item was returned from '+ oldUser.username +'.');
          } else {
            res.status(404).send('Error: Item was not borrowed.');
          }
        });
      } else {
        res.status(404).send('Error: Item not found.');
      }
    })
  } else {
    res.status(401).send('Error: You need to be logged in to check out items.');
  }
});

module.exports = router;

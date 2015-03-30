var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.post('/createItem', function(req, res) {
  // TODO: check if item with label exists
  
  models.Item.create({
    label: req.params('label'),
    name: req.params('name'),
    description: req.params('description'),
    category: req.params('category'),
    url: req.params('url'),
    location: req.params('location'),
    status: req.params('status'),
    condition: req.params('condition'),
    comment: req.params('comment')
  }).then(function() {
    res.redirect('../admin');
  })
});

router.get('/createItem', function(req, res) {
  res.redirect('../admin');
});

router.get('/listItems', function(req,res){
  // querry database to get items
  // render all items
  query = req.param('s');

  models.User.findAll({
    include: [ models.Item ]
  }).then(function(users) {
    models.Item.findAndCountAll({
      where: models.Sequelize.or(
        {label: query},
        {name: query},
        {description: query},
        {category: query},
        {location: query},
        {comment: query}
        ), //["label, name, description, category, location, comment LIKE "+ query],
      offset: 0,
      limit: 2
    }).then(function(result){
      res.render('./index', {
        title: 'Express',
        users: users,
        items: result.rows,
        itemnumber: result.count
      })
    });
  });
})

router.get('/getItem', function(req,res){
  // querry database to get items
  // render all items
  query = req.param('id');

  models.User.findAll({
    include: [ models.Item ]
  }).then(function(users) {
    models.Item.findAndCountAll({
      where: ["label LIKE "+ query],
      offset: 0,
      limit: 2
    }).then(function(result){
      res.render('./index', {
        title: 'Express',
        users: users,
        items: result.rows,
        itemnumber: result.count
      })
    });
  });
})

router.get('/item', function(req,res){
  // querry database with req.query to find:
  // /item?id=0101
  // /item?category=headphones
  // OR /search?query='asd'&page=2
  // return JASON
})

module.exports = router;

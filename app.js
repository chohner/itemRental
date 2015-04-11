var express = require('express');
var app = express();

var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var items = require('./routes/items');

// set global curUser
var curUser;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({ secret: 'SUPERSECRET', cookie: { maxAge: 60000 }}))
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES

var models  = require('./models');

app.get('/', function(req, res) {
  // TODO: dont use param and .success
  // TODO: simplify route
  query = req.param('s');

  models.Item.max('label').then(function(max) {
    maxLabel=max;
  })

  models.User.findAll({
    include: [ models.Item ]
  }).success(function(users) {
    models.Item.findAll({
    }).success(function(items){
      res.render('index', {
        users: users,
        items: items,
        search: query,
        maxLabel: maxLabel
      })
    });
  });
});


app.get('/listItems', function(req, res) {
  models.Item.findAll().then(function(items){
    res.json({'items': items});
  });
});

app.post('/createItem', function(req, res) {
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
app.post('/createItemsBulk', function(req, res) {
  bulkData = req.body;
  models.Item.bulkCreate(
    bulkData
  ).then(function(){
    models.Item.findAll().then(function(items){
      res.send(items);
    })
  });
});

app.post('/createUser', function(req, res) {
  // TODO: check if user with username exists
  // TODO: dont use param and .success
  models.User.create({
    username: req.param('username'),
    firstname: req.param('firstname'),
    lastname: req.param('lastname'),
    email: req.param('email'),
    role: req.param('role'),
    active: req.param('active'),
  }).success(function(title) {
    res.redirect('./');
  }).error(function(error){
    console.log(error);
    res.redirect('./');
  })
});

// Borrow Item route: send username and item label to borrow item
app.post('/borrowItem', function(req,res) {
  
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
app.post('/checkItem', function(req,res) {
  models.Item.find({
    where: {label: req.body.label}
  }).then(function(Item){
    res.send(Item)
  })
});

// Check User route, returns user details
app.post('/checkUser', function(req,res) {
  models.User.find({
    where: {username: req.body.username}
    //include: [ models.Item ]
  }).then(function(myUser){
    res.send(myUser);
  })
});

// checkUserItems Route, returns all borrowed items from username
app.post('/checkUserItems', function(req,res) {
  models.User.find({
    where: {username: req.body.username}
    //include: [ models.Item ]
  }).then(function(myUser){
    myUser.getItems().then(function(associatedItems) {
      res.send(associatedItems)
    })
  })
});

//app.use('/', routes);
//app.use('/users', users);
//app.use('/items', items);

// Redirect all unmatched routes to index
// app.all('*', function(req, res) {
//   res.redirect('/');
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// output pretty html
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

module.exports = app;

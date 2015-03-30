var express = require('express');
var app = express();

var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var items = require('./routes/items');

// CSV PARSE


// set global curUser
var curUser;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES

var models  = require('./models');

app.get('/', function(req, res) {
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

app.get('/uploadCSV', function(req,res){
  models.User.findAll({
    include: [ models.Item ]
  }).success(function(users) {
    models.Item.findAll({
    }).success(function(items){
      res.render('index', {
        users: users,
        items: items,
        search: query
      })
    });
  });
});

app.post('/uploadCSV', function(req,res){
  
  parse(req.body.csvText, {delimiter: ';', comment: '#'}, function(err, output){
    if(err) throw err;
    res.send({
      newitems: output
    });
    console.log(output);
  });

});

app.post('/createItem', function(req, res) {
  // TODO: check if item with label exists
  models.Item.create({
    label: req.param('label'),
    name: req.param('name'),
    description: req.param('description'),
    category: req.param('category'),
    url: req.param('url'),
    location: req.param('location'),
    status: req.param('status'),
    condition: req.param('condition'),
    comment: req.param('comment')
  }).success(function(title) {
    res.redirect('./');
  }).error(function(error){
    console.log(error);
    res.redirect('./');
  })
});

//app.use('/', routes);
//app.use('/users', users);
//app.use('/items', items);

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

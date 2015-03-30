"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
//var config    = require(__dirname + '/../config/config.json')[env];
//var sequelize = new Sequelize(config.database, config.username, config.password, config);
var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  pool: { max: 5, min: 0, idle: 10000},
  storage: 'db.sqlite'
});
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// add adminuser in development
if (env === 'development') {
  db.User.findOrCreate({
    where: {
    username: "hohnerlein.christoph",
    firstname: 'Christoph',
    lastname: 'Hohnerlein' ,
    email: 'a@b.com' ,
    role: 'Admin' ,
    active: '1'
    }
  })
  .spread(function(user, created){
    console.log('Dev-admin created: ' + created)
    console.log(user.get({
      plain: true
    }))
  })
}


function login(loginUser, password){
  //check username + pw against ldap and then against users username
  //-> set current.user, set current.status, change mode to logged_in (greeting etc)
  db.User.find({
    where: {
      username: loginUser,
    }
  })
  .success(function(user,firstname,lastname){
    curUser={
      user: username
    }
  })
  .fail(function(err){
    console.log('Error occured', err);
    return false;
  })
};

function search(searchquery){
  //search text in ID, name, description, category
 // -> update list view with found items
};


function checkout(label){
  //check if logged in
 // -> find all items with id, change status to out, change user_borrowed to current.user
};

function inventory(username){
  //check if logged in AND admin OR username=current.user
  //-> search for items of username
};

function status(){
//  check if logged in
//  -> inventory('current.username'), update borrowed list view
};

function logout(){
  //destroy session, change mode to logged_out
};
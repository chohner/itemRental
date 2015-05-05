"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
//var config    = require(__dirname + '/../config/config.json')[env];
//var sequelize = new Sequelize(config.database, config.username, config.password, config);
var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  omitNull: true,
  pool: { max: 5, min: 0, idle: 10000},
  storage:   (path.join(__dirname, '..', 'db.sqlite'))
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
console.log(env)
if (env === 'development') {
  db.User.findOrCreate({
    where: {
    username:  'admin_user',
    firstname: 'admin',
    lastname:  'user' ,
    role:      'Admin'}
  })
  .spread(function(user, created){
    console.log('Dev-admin created: ' + created)
  })
}

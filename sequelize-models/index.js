// var config = require('./../../config/main')[process.env.STAGE || 'local'];
//
// var Sequelize = require('sequelize'),
//   sequelize = new Sequelize(config.DB_MYSQL_DATABASE, 'root', 'fooledu', {
//     // host: config.host,
//     // port: config.port,
//     // logging: false
//     host: config.DB_MYSQL_HOST,
//     dialect: 'mysql',
//     define: { underscored: true },
//
//     // pool: {
//     //   max: 5,
//     //   min: 0,
//     //   idle: 10000
//     // }
//   }),
//   Category = sequelize.import('../../sequelize-models/Category'),
//   PratilipiCategory = sequelize.import('../../sequelize-models/PratilipiCategory')
//   ;
// PratilipiCategory.belongsTo(Category);


"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
// var env       = process.env.STAGE || "local";
var config    = require('./../config/main')[process.env.STAGE || 'local'];
var sequelize = new Sequelize(config.DB_MYSQL_DATABASE, process.env.MYSQL_DB_USERNAME, process.env.MYSQL_DB_PASSWORD, {
  // host: config.host,
  // port: config.port,
  logging: false,
  host: config.DB_MYSQL_HOST,
  dialect: 'mysql',
  define: { underscored: true },
  pool: {
    max: 5,
    min: 0,
    idle: 20000,
    acquire: 20000
  }

});

var db = {};

var tableModelmap = {
  'categories': 'Category',
  'pratilipis_categories': 'PratilipiCategory'
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[tableModelmap[model.name]] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

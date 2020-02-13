/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var StockHandler = require('../controllers/stockHandler.js');

//https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote
//const DB = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  var stockPrices = new StockHandler();

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = req.query.stock;
      var like = req.query.like || false;
      let ip = req.connection.remoteAddress;
      var stockData = null;
      var likeData = null;
      var multiple = false;
      if (Array.isArray(stock)) {
        multiple = true;
      }

      function finish(dataSource, data) {
        if (dataSource == 'stockData') {
          stockData = data;
        } else {
          likeData = data;
        }
        if (stockData && likeData) {
          if (multiple && stockData.length == 2 && likeData.length == 2) {
            if (stockData[0].stock == likeData[0].stock) {
              stockData[0].rel_likes = likeData[0].likes - likeData[1].likes;
              stockData[1].rel_likes = likeData[1].likes - likeData[0].likes;
            } else {
              stockData[0].rel_likes = likeData[1].likes - likeData[0].likes;
              stockData[1].rel_likes = likeData[0].likes - likeData[1].likes;
            }
          } else if (stockData.length == 1 && likeData.length == 1) {
             stockData[0].likes = likeData[0].likes;
          }
          res.json({'stockData': stockData});
        }
      };


      if (multiple) {
        stockPrices.getData(stock, finish);
        stockPrices.getLikes(stock, ip, like, finish);
      } else {
        stockPrices.getData([stock], finish);
        stockPrices.getLikes([stock], ip, like, finish);
      }

    });

};

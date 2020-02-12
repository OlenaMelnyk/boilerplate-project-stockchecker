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
       // console.log("COL", stock, like, ip);


      function finish(dataSource, data) {
        if (dataSource == 'stockData') {
          stockData = data;
        } else {
          console.log('likesdata', multiple, stockData ? stockData.length : 0, data.length, " + ", data);
          // stockData.likes = data.likes;

          if (multiple && stockData.length == 2 && data.length == 2) {
            console.log("not here?",stockData[0].stock, data[0].stock);
            if (stockData[0].stock == data[0].stock) {
              stockData[0].rel_likes = data[0].likes - data[1].likes;
              stockData[1].rel_likes = data[1].likes - data[0].likes;
            } else {
              stockData[0].rel_likes = data[1].likes - data[0].likes;
              stockData[1].rel_likes = data[0].likes - data[1].likes;
            }
          } else {
             stockData[0].likes = data[0].likes;
          }
          res.json({'stockData': stockData});
        }
        //{"stockData":{"stock":"GOOG","price":"786.90","likes":1}}

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

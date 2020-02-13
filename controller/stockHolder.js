const mongoDB = require('mongodb');
const axios = require('axios');
const CONNECTION_STRING = process.env.DB;
var expect = require('chai').expect;

function StockHandler() {

  this.getData = function(stock, callback) {
    let url = `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`;
    let urls = stock.map((elem) => { return axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${elem}/quote`) });
    axios.all(urls)
    .then(responseArr => {
      let resp = responseArr.map((elem) => {
        return {stock: elem.data.symbol, price:elem.data.latestPrice};
      });
      callback('stockData', resp);
    })
    .catch(error => {
      console.log("Errcode", error.statusCode);
      if (error.response) {
        console.log("error ", url, error.response);
        callback('error', {error: 'external source error'});
       }
    });

  };

  this.getLikes = function(stock, ip, likes, callback) {

    mongoDB.connect(CONNECTION_STRING, function(err, client) {
      expect(err, 'database error').to.not.exist;
      console.log('Successful database connection');
      let database = client.db("test");
      var collection = database.collection("stock_likes");
        if (!likes) {
          let promises = [];
          for (let el of stock) {
            promises.push(findPromise(collection, el));
          }
          Promise.all(promises)
            .then(values => {
              callback('likesData', values);
            })
            .catch(error => {
              console.log("Err:", error);
            });

        } else {
          let resp = [];
          let promises = [];
          for (let el of stock) {
            promises.push(findAndModifyPromise(collection, el, ip));
          }
          Promise.all(promises)
            .then(values => {
              callback('likesData', values);
            })
            .catch(error => {
              console.log("Err:", error);
            });
        }
    });
  };

  function findAndModifyPromise(collection, stock, ip) {
    return new Promise(function(resolve, reject) {
      collection.findAndModify(
              { stock: stock },
              [],
              { $addToSet: { likes: ip } },
              { new: true, upsert: true },
              function(err, doc) {
                resolve({stock: stock, likes: doc.value.likes.length});
              }
            );
    });
  };

  function findPromise(collection, stock) {
    return new Promise(function(resolve, reject) {
        collection.find({stock:stock}).toArray((err, docs) => {
        var like = 0;
        if (docs.length) {
          let likesArr = docs[0].likes;
          like = docs[0].likes.length;
        }
        resolve({stock: stock, likes: like});
        });
      });
  };

};

module.exports = StockHandler;

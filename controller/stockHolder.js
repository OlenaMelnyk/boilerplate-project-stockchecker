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
          let resp = [];
          if (stock.length == 2) {
            const promise1 = new Promise(function(resolve, reject) {
              let el = stock[0].toUpperCase();
              collection.find({stock:el}).toArray((err, docs) => {
              var like = 0;
              if (docs.length && docs[0].length > 0) {
                like = docs[0].likes.length;
              }
              resolve({stock: el, likes: like});
              });
            });
            const promise2 = new Promise(function(resolve, reject) {
              let el = stock[1].toUpperCase();
              collection.find({stock:el}).toArray((err, docs) => {
              var like = 0;
              if (docs.length && docs[0].length > 0) {
                like = docs[0].likes.length;
              }
              resolve({stock: el, likes: like});
              });
            });
            Promise.all([promise1, promise2])
            .then(values => {
              callback('likesData', values);
            })
            .catch(error => {
              console.log("Err:", error);
            });
          } else if (stock.length == 1) {
              let el = stock[0].toUpperCase();
              collection.find({stock:el}).toArray((err, docs) => {
              var like = 0;
              if (docs.length && docs[0].length > 0) {
                like = docs[0].likes.length;
              }
              resp.push({stock: el, likes: true});
                // console.log("Resp:", resp);
              callback('likesData', {stock: el, likes: like});
            });
          }
        } else {
          let resp = [];
          // for (let el of stock) {
          //   collection.findAndModify(
          //     { stock: el },
          //     [],
          //     { $addToSet: { likes: ip } },
          //     { new: true, upsert: true },
          //     function(err, doc) {
          //       resp.push({stock: el, likes: doc.value.likes.length});
          //     }
          //   );
          // }
          console.log("LIKES", resp);
          callback('likesData', resp);
        }
    });
  };

};

module.exports = StockHandler;

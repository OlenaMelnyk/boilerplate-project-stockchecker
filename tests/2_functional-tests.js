/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {

      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
         assert.isObject(res.body, 'response should be an Object');
         assert.isObject(res.body.stockData, 'response should be an Object');
         assert.equal(res.body.stockData.stock, "GOOG");
         assert.equal(res.body.stockData.price, "1518.27");
         assert.equal(res.body.stockData.likes, "0");

          done();
        });
      });

      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'msft', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
         assert.isObject(res.body, 'response should be an Object');
         assert.isObject(res.body.stockData, 'response should be an Object');
         assert.equal(res.body.stockData.stock, "MSFT");
         assert.equal(res.body.stockData.price, "184.71");
         assert.equal(res.body.stockData.likes, "1");

          done();
        });
      });

      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'msft', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
         assert.isObject(res.body, 'response should be an Object');
         assert.isObject(res.body.stockData, 'response should be an Object');
         assert.equal(res.body.stockData.stock, "MSFT");
         assert.equal(res.body.stockData.price, "184.71");
         assert.equal(res.body.stockData.likes, "1");

          done();
        });
      });

      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','aapl']})
        .end(function(err, res){
          assert.equal(res.status, 200);

         assert.isObject(res.body, 'response should be an Object');
         assert.isArray(res.body.stockData, 'response should be an Array');
         assert.equal(res.body.stockData[0].stock, "GOOG");
         assert.equal(res.body.stockData[0].price, "1518.27");
         assert.equal(res.body.stockData[0].rel_likes, "0");
         assert.equal(res.body.stockData[1].stock, "AAPL");
         assert.equal(res.body.stockData[1].price, "327.2");
         assert.equal(res.body.stockData[1].rel_likes, "0");

          done();
        });
      });

      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['msft','aapl'], like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);

         assert.isObject(res.body, 'response should be an Object');
         assert.isArray(res.body.stockData, 'response should be an Array');
         assert.equal(res.body.stockData[0].stock, "MSFT");
         assert.equal(res.body.stockData[0].price, "184.71");
         assert.equal(res.body.stockData[0].rel_likes, "0");
         assert.equal(res.body.stockData[1].stock, "AAPL");
         assert.equal(res.body.stockData[1].price, "327.2");
         assert.equal(res.body.stockData[1].rel_likes, "0");

          done();
        });


      });

    });

});

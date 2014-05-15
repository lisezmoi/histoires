var mocha = require('mocha');
var chai = require('chai');
var twitterUrl = require('../lib/twitter-url');

chai.should();

describe('lib/twitter-url', function(){
  describe('#urlToId()', function() {
    it('Should transform an URL into an ID', function() {
      var url = 'https://twitter.com/raphaelbastide/status/465863631687938049';
      twitterUrl.urlToId(url).should.equal('raphaelbastide:465863631687938049');
    });
    it('Should handle HTTP URLs', function() {
      var url = 'http://twitter.com/raphaelbastide/status/465863631687938049';
      twitterUrl.urlToId(url).should.equal('raphaelbastide:465863631687938049');
    });
  });
  describe('#idToUrl()', function() {
    it('Should transform an ID into an URL', function() {
    });
  });
});

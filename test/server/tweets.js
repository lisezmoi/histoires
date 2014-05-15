var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var fs = require('fs');
var tweets = require('../../server/tweets');
var rimraf = require('rimraf');

chai.should();
chai.use(require('chai-as-promised'));
nock.disableNetConnect();

var CACHE_DIR = __dirname + '/cache';

function clearCache() {
  rimraf.sync(CACHE_DIR);
  fs.mkdirSync(CACHE_DIR);
}

describe('server/tweets', function(){
  var tweet1 = '1735237290';
  var tweet2 = '464259582358220800';
  var tweet1Html = require('./fixtures/' + tweet1 + '.json').html;

  mockoauth2();
  mockconfiguration();
  mockratelimit();

  mockembed(tweet1);
  mockembed(tweet2);

  var tw = tweets({
    consumer_key: 'AAA',
    consumer_secret: 'BBB',
    cacheDir: CACHE_DIR
  });

  describe('#cache()', function() {
    it('should cache a tweet in the cache directory', function(done) {
      clearCache();
      tw.cache(tweet1, tweet1Html).should.be.fulfilled.then(function() {
        var cached = fs.readFileSync(CACHE_DIR + '/' + tweet1, 'utf8');
        cached.should.equal(tweet1Html);
      }).should.notify(done);
    });
  });

  describe('#tweetFromApi()', function() {
    it('should fetch a tweet from the API', function(done) {
      clearCache();
      tw.tweetFromApi(tweet1).should.be.fulfilled.then(function(content) {
        content.should.equal(tweet1Html);
      }).should.notify(done);
    });
  });

  describe('#embedCode()', function() {
    it('should fetch and cache a tweet', function(done) {
      clearCache();
      tw.embedCode(tweet1).should.be.fulfilled.then(function(html) {
        var cached = fs.readFileSync(CACHE_DIR + '/' + tweet1, 'utf8');
        html.should.equal(tweet1Html);
        cached.should.equal(tweet1Html);
      }).should.notify(done);
    });
  });
});

function mockembed(id) {
  nock('https://api.twitter.com')
    .persist()
    .get('/1.1/statuses/oembed.json?id=' + id + '&omit_script=true&hide_media=false&hide_thread=false')
    .replyWithFile(200, __dirname + '/fixtures/' + id + '.json');
}

function mockoauth2() {
  nock('https://api.twitter.com')
    .persist()
    .post('/oauth2/token')
    .reply(200, '{"token_type":"bearer","access_token":"AAAA%2FAAA%3DAAAAAAAA"}');
}

function mockconfiguration() {
  nock('https://api.twitter.com')
    .persist()
    .get('/1.1/help/configuration.json')
    .replyWithFile(200, __dirname + '/fixtures/configuration.json');
}

function mockratelimit() {
  nock('https://api.twitter.com')
    .persist()
    .get('/1.1/application/rate_limit_status.json')
    .replyWithFile(200, __dirname + '/fixtures/ratelimit.json');
}

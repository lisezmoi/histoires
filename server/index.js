var express = require('express');
var compress = require('compression');
var createTweets = require('./tweets');
var fs = require('fs');
var ONE_DAY = 86400000;

var config = require('../config.json');
config.application_only = true;
config.cacheDir = __dirname + '/../cache';

var tweets = createTweets(config);

var app = express();
app.use(compress());
app.use(express.static(__dirname + '/../client', { maxAge: ONE_DAY }));

app.get('/', (function() {
  return function(req, res) {
    var content = fs.readFileSync(__dirname + '/../client/index.html');
    res.end(content);
  };
}()));

app.get('/tweet/:id', function(req, res) {
  res.type('text/plain');
  res.header('Cache-Control', 'public, max-age=' + (ONE_DAY / 1000));
  tweets.embedCode(req.params.id).then(function(html) {
    res.end(html);
  }, function() {
    res.end('error');
  });
});

app.listen(process.env.PORT || 3000);
console.log('\n  Server listening at http://localhost:3000/\n');

var Twitter = require('mtwitter');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

module.exports = function tweets(settings) {
  if (!settings.consumer_key ||
      !settings.consumer_secret) {
    throw new Error('consumer_key and consumer_secret must be provided');
  }

  settings.skipQueue = true;

  var twitter = new Twitter(settings);
  var cacheDir = settings.cacheDir || null;

  return {
    cache: function(id, content) {
      return cacheTweet(id, content, cacheDir);
    },
    embedCode: function(id) {
      return embedCode(twitter, id, cacheDir);
    },
    tweetFromApi: function(id) {
      return tweetFromApi(twitter, id);
    },
    mtwitter: twitter
  };
};

function embedCode(twitter, id, cacheDir) {
  if (!cacheDir) {
    return tweetFromApi(twitter, id);
  }
  return fs.readFileAsync(cacheDir + '/' + id, 'utf8').catch(function(err) {
    return tweetFromApi(twitter, id).then(function(content) {
      return cacheTweet(id, content, cacheDir);
    });
  });
}

function cacheTweet(id, content, cacheDir) {
  return new Promise(function(resolve, reject) {
    if (!cacheDir) {
      reject(new Error('No cache directory defined'));
    }
    fs.writeFile(cacheDir + '/' + id, content, function(err) {
      if (err) reject(err);
      else resolve(content);
    });
  });
}

function tweetFromApi(twitter, id) {
  return new Promise(function(resolve, reject) {
    twitter.get(
      'statuses/oembed.json', {
        id: id,
        omit_script: true,
        hide_media: false,
        hide_thread: false
      },
      function(err, data, response) {
        if (err) return reject(err);
        if (!data.html) return reject('no html');
        resolve(data.html);
      });
  });
}

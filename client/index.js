var minihash = require('minihash');
var httpinvoke = require('httpinvoke');
var _ = require('underscore');
var twitterUrl = require('../lib/twitter-url');

var OEMBED_URL = '/tweet/';

var updateWidgets = _.debounce(function() {
  window.twttr.widgets.load();
}, 100);

function item(id, container) {
  var elt = container.appendChild(document.createElement('div'));
  var request = httpinvoke(OEMBED_URL + id, 'GET');
  request.then(function(res) {
    if (res.statusCode !== 200) return;
    elt.innerHTML = res.body;
    updateWidgets();
  }, function(err) {
  });
  return request;
}

function reset(container, requests) {
  requests.forEach(function(abort) {
    abort();
  });
  container.innerHTML = '';
}

function noEmpty(values) {
  return values.filter(function(value) {
    return value && value.trim();
  });
}

function focusEdit(textarea) {
  textarea.focus();
  var value = textarea.value;
  textarea.value = '';
  textarea.value = value;
}

function init(textarea, edit, container) {
  var urls = [];
  var requests = [];
  var waitForHash = true;

  var hash = minihash('!/', function(value) {
    reset(container, requests);
    var ids = noEmpty(value.split(','));
    ids.forEach(function(id) {
      var parts = id.split(':');
      if (parts.length !== 2) return;
      requests.push(item(parts[1], container));
    });
    textarea.value = ids.map(twitterUrl.idToUrl).join('\n') + '\n';
  });

  textarea.addEventListener('keypress', function() {
    setTimeout(function() {
      var ids = textarea.value.split('\n').map(twitterUrl.urlToId);
      waitForHash = false;
      hash.value = noEmpty(ids).join(',');
    }, 0);
  }, false);

  edit.addEventListener('click', function() {
    var editMode = document.body.classList.toggle('edit');
    this.innerHTML = editMode? 'Done' : 'Edit';
    if (editMode) focusEdit(textarea);
  });
}

init(
  document.querySelector('textarea'),
  document.querySelector('#edit'),
  document.querySelector('.tweets')
);

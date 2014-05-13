var minihash = require('minihash');
var httpinvoke = require('httpinvoke');
var _ = require('underscore');

var URL_REG = /twitter\.com\/([^\/]+)\/status\/([^\/]+)/;
var URL_TPL = 'https://twitter.com/{0}/status/{1}';
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

function urlToId(url) {
  var parts = url.match(URL_REG);
  if (!parts || !parts[0]) return null;
  return parts[1] + ':' + parts[2];
}

function idToUrl(id) {
  var parts = id.split(':');
  return URL_TPL
    .replace(/\{0\}/, parts[0])
    .replace(/\{1\}/, parts[1]);
}

function reset(container, requests) {
  requests.forEach(function(abort) {
    abort();
  });
  container.innerHTML = '';
}

function filterEmptyIds(ids) {
  return ids.filter(function(value) {
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
    var ids = filterEmptyIds(value.split(','));
    ids.forEach(function(id) {
      var parts = id.split(':');
      if (parts.length !== 2) return;
      requests.push(item(parts[1], container));
    });
    textarea.value = ids.map(idToUrl).join('\n') + '\n';
  });

  textarea.addEventListener('keypress', function() {
    setTimeout(function() {
      var ids = textarea.value.split('\n').map(urlToId);
      waitForHash = false;
      hash.value = filterEmptyIds(ids).join(',');
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
